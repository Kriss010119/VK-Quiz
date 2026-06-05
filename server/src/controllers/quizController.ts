import { Request, Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, time_per_question = 30, max_participants = 50, is_public = true, tags = [] } = req.body;
    const room_code = generateRoomCode();
    
    let finalRoomCode = room_code;
    let isUnique = false;
    while (!isUnique) {
      const existing = await query('SELECT id FROM quizzes WHERE room_code = $1', [finalRoomCode]);
      if (existing.rows.length === 0) {
        isUnique = true;
      } else {
        finalRoomCode = generateRoomCode();
      }
    }
    
    const result = await query(
      `INSERT INTO quizzes (organizer_id, title, description, room_code, time_per_question, max_participants, status, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft', $7)
       RETURNING *`,
      [req.user?.id, title, description, finalRoomCode, time_per_question, max_participants, is_public]
    );

    const quiz = result.rows[0];

    if (Array.isArray(tags) && tags.length > 0) {
      for (const tag of tags) {
        if (typeof tag === 'string' && tag.trim()) {
          await query(
            'INSERT INTO quiz_tags (quiz_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [quiz.id, tag.trim()]
          );
        }
      }
    }
    
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyQuizzes = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const result = await query(
      `SELECT q.*, COUNT(qs.id) as participant_count,
              COALESCE(ARRAY_AGG(DISTINCT qt.tag) FILTER (WHERE qt.tag IS NOT NULL), '{}') as tags
       FROM quizzes q
       LEFT JOIN quiz_sessions qs ON q.id = qs.quiz_id
       LEFT JOIN quiz_tags qt ON q.id = qt.quiz_id
       WHERE q.organizer_id = $1
       GROUP BY q.id
       ORDER BY q.created_at DESC`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get my quizzes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getQuizById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid quiz ID format' });
    }
    
    const quizResult = await query(
      `SELECT q.*, u.name as organizer_name
       FROM quizzes q
       JOIN users u ON q.organizer_id = u.id
       WHERE q.id = $1`,
      [id]
    );
    
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const questionsResult = await query(
      `SELECT * FROM questions WHERE quiz_id = $1 ORDER BY order_index`,
      [id]
    );
    
    const questions = await Promise.all(
      questionsResult.rows.map(async (question) => {
        const optionsResult = await query(
          `SELECT id, text, is_correct, order_index 
           FROM options 
           WHERE question_id = $1 
           ORDER BY order_index`,
          [question.id]
        );
        
        return { 
          ...question, 
          options: optionsResult.rows 
        };
      })
    );

    const tagsResult = await query(
      'SELECT tag FROM quiz_tags WHERE quiz_id = $1',
      [id]
    );
    
    res.json({ ...quizResult.rows[0], questions, tags: tagsResult.rows.map(t => t.tag) });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAvailableQuizzes = async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT 
         q.*, 
         u.name as author_name,
         COALESCE(ARRAY_AGG(DISTINCT qt.tag) FILTER (WHERE qt.tag IS NOT NULL), '{}') as tags
       FROM quizzes q
       JOIN users u ON q.organizer_id = u.id
       LEFT JOIN quiz_tags qt ON q.id = qt.quiz_id
       WHERE q.status IN ('waiting', 'active')
       GROUP BY q.id, u.name
       ORDER BY q.created_at DESC
       LIMIT 20`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get available quizzes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const publishQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const quizCheck = await query(
      'SELECT organizer_id FROM quizzes WHERE id = $1',
      [id]
    );
    
    if (quizCheck.rows.length === 0 || quizCheck.rows[0].organizer_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const questionsCheck = await query('SELECT COUNT(*) FROM questions WHERE quiz_id = $1', [id]);
    if (parseInt(questionsCheck.rows[0].count) === 0) {
      return res.status(400).json({ error: 'Quiz must have at least one question' });
    }
    
    await query(
      'UPDATE quizzes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['waiting', id]
    );
    
    res.json({ message: 'Quiz published successfully' });
  } catch (error) {
    console.error('Publish quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const startQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const quizCheck = await query(
      'SELECT organizer_id FROM quizzes WHERE id = $1',
      [id]
    );
    
    if (quizCheck.rows.length === 0 || quizCheck.rows[0].organizer_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await query(
      'UPDATE quizzes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['active', id]
    );
    
    res.json({ message: 'Quiz started successfully' });
  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const stopQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const quizCheck = await query('SELECT organizer_id FROM quizzes WHERE id = $1', [id]);
    if (quizCheck.rows.length === 0 || quizCheck.rows[0].organizer_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await query('UPDATE quizzes SET status = $1 WHERE id = $2', ['finished', id]);
    res.json({ message: 'Quiz stopped successfully' });
  } catch (error) {
    console.error('Stop quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const finishQuizController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log(`Finishing quiz: ${id}`);
    
    const quizCheck = await query('SELECT organizer_id FROM quizzes WHERE id = $1', [id]);
    if (quizCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    if (quizCheck.rows[0].organizer_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const result = await query('UPDATE quizzes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', ['finished', id]);
    console.log('Quiz status updated:', result.rows[0]);
    
    res.json({ message: 'Quiz finished successfully', quiz: result.rows[0] });
  } catch (error) {
    console.error('Finish quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, time_per_question, max_participants, is_public, tags } = req.body;
    
    const quizCheck = await query(
      'SELECT organizer_id FROM quizzes WHERE id = $1',
      [id]
    );
    
    if (quizCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    if (quizCheck.rows[0].organizer_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const result = await query(
      `UPDATE quizzes 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           time_per_question = COALESCE($3, time_per_question),
           max_participants = COALESCE($4, max_participants),
           is_public = COALESCE($5, is_public),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [title, description, time_per_question, max_participants, is_public, id]
    );

    if (Array.isArray(tags)) {
      await query('DELETE FROM quiz_tags WHERE quiz_id = $1', [id]);
      for (const tag of tags) {
        if (typeof tag === 'string' && tag.trim()) {
          await query(
            'INSERT INTO quiz_tags (quiz_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [id, tag.trim()]
          );
        }
      }
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { id: quizId } = req.params;
    const { type, text, image_url, points, options } = req.body;
    
    const quizCheck = await query(
      'SELECT organizer_id FROM quizzes WHERE id = $1',
      [quizId]
    );
    
    if (quizCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    if (quizCheck.rows[0].organizer_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const orderResult = await query(
      'SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM questions WHERE quiz_id = $1',
      [quizId]
    );
    const nextOrder = orderResult.rows[0].next_order;
    
    const questionResult = await query(
      `INSERT INTO questions (quiz_id, type, text, image_url, points, order_index)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [quizId, type, text, image_url || null, points || 100, nextOrder]
    );
    
    const question = questionResult.rows[0];
    
    if (options && Array.isArray(options) && options.length > 0) {
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        const isCorrect = opt.is_correct === true || opt.is_correct === 'true';
        
        await query(
          `INSERT INTO options (question_id, text, is_correct, order_index)
           VALUES ($1, $2, $3, $4)`,
          [question.id, opt.text, isCorrect, i]
        );
      }
    }
    
    const optionsResult = await query(
      'SELECT id, text, is_correct, order_index FROM options WHERE question_id = $1 ORDER BY order_index',
      [question.id]
    );
    
    res.status(201).json({ ...question, options: optionsResult.rows });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
};

export const updateQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { quizId, questionId } = req.params;
    const { type, text, image_url, points, options } = req.body;
    
    const quizCheck = await query(
      'SELECT organizer_id FROM quizzes WHERE id = $1',
      [quizId]
    );
    
    if (quizCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    if (quizCheck.rows[0].organizer_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await query(
      `UPDATE questions 
       SET type = $1, text = $2, image_url = $3, points = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [type, text, image_url || null, points, questionId]
    );
    
    await query('DELETE FROM options WHERE question_id = $1', [questionId]);
    
    if (options && Array.isArray(options) && options.length > 0) {
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        let isCorrect = false;
        if (typeof opt.is_correct === 'boolean') {
          isCorrect = opt.is_correct;
        } else if (typeof opt.is_correct === 'string') {
          isCorrect = opt.is_correct === 'true';
        } else {
          isCorrect = !!opt.is_correct;
        }
        
        await query(
          `INSERT INTO options (question_id, text, is_correct, order_index)
           VALUES ($1, $2, $3, $4)`,
          [questionId, opt.text, isCorrect, i]
        );
      }
    }
    
    const updatedOptions = await query(
      'SELECT id, text, is_correct, order_index FROM options WHERE question_id = $1 ORDER BY order_index',
      [questionId]
    );
    
    res.json({ 
      message: 'Question updated successfully',
      options: updatedOptions.rows 
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
};

export const deleteQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { quizId, questionId } = req.params;
    
    const quizCheck = await query(
      'SELECT organizer_id FROM quizzes WHERE id = $1',
      [quizId]
    );
    
    if (quizCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    if (quizCheck.rows[0].organizer_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await query('DELETE FROM questions WHERE id = $1 AND quiz_id = $2', [questionId, quizId]);
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
};

export const getActiveRoomsWithoutHost = async (req: AuthRequest, res: Response) => {
  try {
    const activeRooms = await query(
      `SELECT id FROM quizzes WHERE status = 'active' AND organizer_id = $1`,
      [req.user?.id]
    );
    
    res.json(activeRooms.rows.map(row => row.id));
  } catch (error) {
    console.error('Error getting active rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const likeQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await query(
      'INSERT INTO quiz_likes (user_id, quiz_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user?.id, id]
    );
    res.json({ message: 'Quiz liked' });
  } catch (error) {
    console.error('Like quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unlikeQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await query(
      'DELETE FROM quiz_likes WHERE user_id = $1 AND quiz_id = $2',
      [req.user?.id, id]
    );
    res.json({ message: 'Quiz unliked' });
  } catch (error) {
    console.error('Unlike quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLikedQuizzes = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT q.*, u.name as author_name, ql.created_at as liked_at,
              COALESCE(ARRAY_AGG(DISTINCT qt.tag) FILTER (WHERE qt.tag IS NOT NULL), '{}') as tags
       FROM quiz_likes ql
       JOIN quizzes q ON ql.quiz_id = q.id
       JOIN users u ON q.organizer_id = u.id
       LEFT JOIN quiz_tags qt ON q.id = qt.quiz_id
       WHERE ql.user_id = $1
       GROUP BY q.id, u.name, ql.created_at
       ORDER BY ql.created_at DESC`,
      [req.user?.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get liked quizzes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const searchQuizzes = async (req: Request, res: Response) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.json({ quizzes: [], total: 0 });
    }
    
    const searchTerm = `%${q.toLowerCase().trim()}%`;
    
    const result = await query(
      `SELECT 
         q.*, 
         u.name as author_name,
         COALESCE(ARRAY_AGG(DISTINCT qt.tag) FILTER (WHERE qt.tag IS NOT NULL), '{}') as tags
       FROM quizzes q
       JOIN users u ON q.organizer_id = u.id
       LEFT JOIN quiz_tags qt ON q.id = qt.quiz_id
       WHERE q.status IN ('waiting', 'active')
         AND (
           LOWER(q.title) LIKE $1 OR
           LOWER(q.description) LIKE $1 OR
           LOWER(q.room_code) LIKE $1 OR
           LOWER(u.name) LIKE $1
         )
       GROUP BY q.id, u.name
       ORDER BY 
         CASE 
           WHEN LOWER(q.title) LIKE $1 THEN 1
           WHEN LOWER(u.name) LIKE $1 THEN 2
           ELSE 3
         END,
         q.created_at DESC
       LIMIT $2`,
      [searchTerm, parseInt(limit as string)]
    );
    
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM quizzes q
       JOIN users u ON q.organizer_id = u.id
       WHERE q.status IN ('waiting', 'active')
         AND (
           LOWER(q.title) LIKE $1 OR
           LOWER(q.description) LIKE $1 OR
           LOWER(q.room_code) LIKE $1 OR
           LOWER(u.name) LIKE $1
         )`,
      [searchTerm]
    );
    
    res.json({
      quizzes: result.rows,
      total: parseInt(countResult.rows[0].total),
      query: q
    });
  } catch (error) {
    console.error('Search quizzes error:', error);
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
};

export const deleteQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const quizCheck = await query('SELECT organizer_id FROM quizzes WHERE id = $1', [id]);
    if (quizCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    if (quizCheck.rows[0].organizer_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await query('DELETE FROM options WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = $1)', [id]);
    await query('DELETE FROM questions WHERE quiz_id = $1', [id]);
    await query('DELETE FROM quiz_tags WHERE quiz_id = $1', [id]);
    await query('DELETE FROM answers WHERE session_id IN (SELECT id FROM quiz_sessions WHERE quiz_id = $1)', [id]);
    await query('DELETE FROM quiz_sessions WHERE quiz_id = $1', [id]);
    await query('DELETE FROM quiz_likes WHERE quiz_id = $1', [id]);
    await query('DELETE FROM quizzes WHERE id = $1', [id]);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getQuizSessions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT 
         qs.id,
         u.name as user_name,
         qs.score,
         qs.joined_at,
         qs.completed_at
       FROM quiz_sessions qs
       JOIN users u ON qs.user_id = u.id
       WHERE qs.quiz_id = $1 AND qs.completed_at IS NOT NULL
       ORDER BY qs.score DESC, qs.completed_at DESC`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting quiz sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
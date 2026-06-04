import { Request, Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body;
    
    const result = await query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           email = COALESCE($2, email),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, email, role, created_at`,
      [name, email, req.user?.id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.user?.id]);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLastQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    console.log('Getting last quiz for user:', userId);
    
    const playerResult = await query(
      `SELECT 
         q.id,
         q.title, 
         u.name as organizer_name,
         qs.score,
         qs.completed_at,
         'player' as role
       FROM quiz_sessions qs
       JOIN quizzes q ON qs.quiz_id = q.id
       JOIN users u ON q.organizer_id = u.id
       WHERE qs.user_id = $1 AND qs.completed_at IS NOT NULL
       ORDER BY qs.completed_at DESC
       LIMIT 1`,
      [userId]
    );
    
    const organizerResult = await query(
      `SELECT 
         q.id,
         q.title,
         u.name as organizer_name,
         q.created_at,
         'organizer' as role
       FROM quizzes q
       JOIN users u ON q.organizer_id = u.id
       WHERE q.organizer_id = $1
       ORDER BY q.created_at DESC
       LIMIT 1`,
      [userId]
    );
    
    const playerQuiz = playerResult.rows[0];
    const organizerQuiz = organizerResult.rows[0];
    
    let lastQuiz;
    let isOrganizer = false;
    
    if (playerQuiz && organizerQuiz) {
      const playerDate = new Date(playerQuiz.completed_at);
      const organizerDate = new Date(organizerQuiz.created_at);
      if (playerDate >= organizerDate) {
        lastQuiz = playerQuiz;
      } else {
        lastQuiz = organizerQuiz;
        isOrganizer = true;
      }
    } else if (playerQuiz) {
      lastQuiz = playerQuiz;
    } else if (organizerQuiz) {
      lastQuiz = organizerQuiz;
      isOrganizer = true;
    }
    
    if (!lastQuiz) {
      console.log('No quizzes found for user');
      return res.json(null);
    }
    
    console.log('Last quiz found:', lastQuiz.title, '(as', isOrganizer ? 'organizer' : 'player', ')');
    
    const leaderboardResult = await query(
      `SELECT 
         u.name,
         qs.score
       FROM quiz_sessions qs
       JOIN users u ON qs.user_id = u.id
       WHERE qs.quiz_id = $1 AND qs.completed_at IS NOT NULL
       ORDER BY qs.score DESC
       LIMIT 3`,
      [lastQuiz.id]
    );
    
    console.log('Leaderboard rows:', leaderboardResult.rows.length);
    
    let userPlace = '';
    if (!isOrganizer && playerQuiz) {
      const rankResult = await query(
        `SELECT COUNT(*) + 1 as rank
         FROM quiz_sessions
         WHERE quiz_id = $1 AND completed_at IS NOT NULL AND score > $2`,
        [lastQuiz.id, playerQuiz.score]
      );
      const rank = rankResult.rows[0]?.rank || 1;
      userPlace = `#${rank}`;
    }
    
    const topPlayers = [];
    for (let i = 0; i < 3; i++) {
      if (leaderboardResult.rows[i]) {
        topPlayers.push({
          name: leaderboardResult.rows[i].name,
          place: i + 1,
          score: leaderboardResult.rows[i].score
        });
      } else {
        topPlayers.push({
          name: '',
          place: i + 1,
          score: 0
        });
      }
    }
    
    const dateField = lastQuiz.completed_at || lastQuiz.created_at;
    
    res.json({
      name: lastQuiz.title,
      author: lastQuiz.organizer_name,
      date: new Date(dateField).toLocaleDateString('ru-RU'),
      userPlace: userPlace || (isOrganizer ? 'Organizer' : ''),
      topPlayers: topPlayers
    });
  } catch (error) {
    console.error('Get last quiz error:', error);
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
};

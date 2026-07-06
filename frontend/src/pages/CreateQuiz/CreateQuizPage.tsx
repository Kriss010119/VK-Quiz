/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { PageLayout, BackLink } from '../../components';
import { Check, Cross, Trash } from '../../components/Icons';
import catHideImage from '../../assets/catHidden.svg';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './CreateQuizPage.module.css';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  imageUrl?: string;
}

const createBlankQuestion = (): Question => {
  const ts = Date.now();
  return {
    id: `q-${ts}`,
    text: '',
    options: [
      { id: `o-${ts}-1`, text: '', isCorrect: false },
      { id: `o-${ts}-2`, text: '', isCorrect: false },
    ],
  };
};

export const CreateQuizPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    isPublic: true,
  });

  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [roomCode] = useState('');
  const [creationDate, setCreationDate] = useState('');

  useEffect(() => {
    const now = new Date();
    setCreationDate(
      `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`
    );
  }, []);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, createBlankQuestion()]);
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const updateQuestionText = (questionId: string, text: string) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, text } : q
    ));
  };

  const toggleCorrect = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        options: q.options.map(opt =>
          opt.id === optionId ? { ...opt, isCorrect: !opt.isCorrect } : opt
        ),
      };
    }));
  };

  const updateAnswerText = (questionId: string, optionId: string, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        options: q.options.map(opt =>
          opt.id === optionId ? { ...opt, text } : opt
        ),
      };
    }));
  };

  const addAnswer = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        options: [
          ...q.options,
          { id: `o-${Date.now()}`, text: '', isCorrect: false },
        ],
      };
    }));
  };

  const removeAnswer = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      if (q.options.length <= 2) {
        toast.error('Minimum 2 answers');
        return q;
      }
      return {
        ...q,
        options: q.options.filter(opt => opt.id !== optionId),
      };
    }));
  };

  const handleImageUpload = async (questionId: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setQuestions(questions.map(q =>
        q.id === questionId ? { ...q, imageUrl: res.data.url } : q
      ));
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    }
  };

  const handleImageRemove = (questionId: string) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, imageUrl: undefined } : q
    ));
  };

  const handleSaveQuiz = async () => {
    if (!quizData.title.trim()) {
      toast.error('Enter quiz name');
      return;
    }
    if (questions.length === 0) {
      toast.error('Add at least one question');
      return;
    }

    for (const q of questions) {
      if (!q.text.trim()) {
        toast.error('Fill in all question titles');
        return;
      }
      const hasEmpty = q.options.some(o => !o.text.trim());
      if (hasEmpty) {
        toast.error('Fill in all answer options');
        return;
      }
      const hasCorrect = q.options.some(o => o.isCorrect);
      if (!hasCorrect) {
        toast.error('Mark at least one correct answer per question');
        return;
      }
    }

    setIsSaving(true);
    try {
      const response = await api.post('/quizzes', {
        title: quizData.title,
        description: quizData.description,
        time_per_question: 30,
        max_participants: 50,
        is_public: quizData.isPublic,
        tags,
      });

      const quizId = response.data.id;

      for (const question of questions) {
        const correctCount = question.options.filter(o => o.isCorrect).length;
        await api.post(`/quizzes/${quizId}/questions`, {
          type: correctCount > 1 ? 'multiple' : 'single',
          text: question.text,
          image_url: question.imageUrl || null,
          points: 100,
          options: question.options.map(opt => ({
            text: opt.text,
            is_correct: opt.isCorrect,
          })),
        });
      }

      toast.success('Quiz created!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create quiz');
    } finally {
      setIsSaving(false);
    }
  };

  const sidebarUser = user || { name: 'Kriss Vector', email: 'krissvec@vk.com' };

  return (
    <PageLayout
      sidebar={
        <Sidebar
          user={sidebarUser}
        />
      }
    >
      <Header />

      <div className={styles.contentWrap}>
      <div className={styles.topMenu}>
        <BackLink onClick={() => navigate('/')} />
        <h1 className={styles.pageTitle}>CREATE QUIZ</h1>
        <button
          className={styles.saveBtn}
          onClick={handleSaveQuiz}
          disabled={isSaving}
        >
          {isSaving ? 'SAVING...' : 'SAVE'}
        </button>
      </div>

      <div className={styles.infoRow}>
        <div className={styles.infoBlock}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Author:</label>
            <span className={styles.fieldValue}>{sidebarUser.name}</span>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Quiz name:</label>
            <input
              type="text"
              className={styles.textInput}
              placeholder="Name of the quiz"
              value={quizData.title}
              onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Room number:</label>
            <span className={styles.fieldValue}>{roomCode || 'After saving'}</span>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Creation date:</label>
            <span className={styles.fieldValue}>{creationDate}</span>
          </div>

          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="quizType"
                checked={quizData.isPublic}
                onChange={() => setQuizData({ ...quizData, isPublic: true })}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>public</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="quizType"
                checked={!quizData.isPublic}
                onChange={() => setQuizData({ ...quizData, isPublic: false })}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>private</span>
            </label>
          </div>
        </div>

        <div className={styles.infoBlock}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Description:</label>
            <textarea
              className={styles.textarea}
              placeholder="Description text"
              value={quizData.description}
              onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Tags:</label>
            <div className={styles.tagsInputContainer}>
              <input
                type="text"
                className={styles.tagInput}
                placeholder="tag"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className={styles.addTagBtn} onClick={handleAddTag}>+</button>
            </div>
            <div className={styles.tagsContainer}>
              {tags.map((tag, i) => (
                <span key={i} className={styles.tag}>
                  {tag}
                  <button className={styles.removeTagBtn} onClick={() => handleRemoveTag(tag)}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.questionsSection}>
        <div className={styles.questionsHeader}>
          <button className={styles.createQuestionBtn} onClick={addQuestion}>
            CREATE QUESTION
          </button>
          {questions.length > 0 && (
            <span className={styles.questionsCount}>All questions: {questions.length}</span>
          )}
        </div>

        <div className={styles.questionsArea}>
          {questions.length === 0 ? (
            <div className={styles.emptyState}>
              <img src={catHideImage} alt="cat" className={styles.emptyCat} />
              <p className={styles.emptyText}>Any questions?</p>
            </div>
          ) : (
            <div className={styles.questionsList}>
              {questions.map((question, qIdx) => (
                <div key={question.id} className={styles.questionBlock}>
                  <div className={styles.questionBlockHeader}>
                    <span className={styles.questionNumber}>Question {qIdx + 1}</span>
                    <button
                      className={styles.deleteQuestionBtn}
                      onClick={() => deleteQuestion(question.id)}
                    >
                      DELETE
                    </button>
                  </div>

                  <input
                    type="text"
                    className={styles.questionTitleInput}
                    placeholder="Your question?"
                    value={question.text}
                    onChange={(e) => updateQuestionText(question.id, e.target.value)}
                  />

                  {question.imageUrl ? (
                    <div className={styles.imagePreview}>
                      <img src={question.imageUrl} alt="question" className={styles.previewImg} />
                      <button className={styles.removeImageBtn} onClick={() => handleImageRemove(question.id)}>
                        <Trash />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.loadImgRow}>
                      <span className={styles.loadImgLabel}>Load img:</span>
                      <label className={styles.loadImgBtn}>
                        LOAD
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(question.id, file);
                          }}
                        />
                      </label>
                    </div>
                  )}

                  <span className={styles.answersLabel}>Answers:</span>

                  <div className={styles.answersList}>
                    {question.options.map((option) => (
                      <div key={option.id} className={styles.answerRow}>
                        <button
                          className={`${styles.toggle} ${option.isCorrect ? styles.toggleCorrect : styles.toggleWrong}`}
                          onClick={() => toggleCorrect(question.id, option.id)}
                        >
                          {option.isCorrect ? <Check /> : <Cross />}
                        </button>
                        <input
                          type="text"
                          className={styles.answerInput}
                          placeholder="Answer for question"
                          value={option.text}
                          onChange={(e) => updateAnswerText(question.id, option.id, e.target.value)}
                        />
                        <button
                          className={styles.removeAnswerBtn}
                          onClick={() => removeAnswer(question.id, option.id)}
                        >
                          <Trash />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className={styles.addAnswerArea} onClick={() => addAnswer(question.id)}>
                    <span className={styles.addAnswerText}>Click to add new answer</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {questions.length > 0 && (
        <div className={styles.bottomBar}>
          <button
            className={styles.bottomSaveBtn}
            onClick={handleSaveQuiz}
            disabled={isSaving}
          >
            {isSaving ? 'SAVING...' : 'SAVE'}
          </button>
        </div>
      )}
      </div>

      <Footer />
    </PageLayout>
  );
};

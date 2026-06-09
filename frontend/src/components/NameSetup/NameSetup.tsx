import { useState } from 'react';
import { Header, Footer, HomeContainer } from '..';
import { Button } from '../Buttons';
import styles from './NameSetup.module.css';

interface NameSetupProps {
  roomCode: string;
  onSetName: (name: string) => void;
}

export const NameSetup = ({ roomCode, onSetName } : NameSetupProps) => {
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = () => {
    if (playerName.trim()) {
      onSetName(playerName);
    }
  };

  return (
    <HomeContainer>
      <Header />
      <div className={styles.nameSetup}>
        <div className={styles.nameCard}>
          <h1>JOIN QUIZ</h1>
          <p className={styles.roomCodeDisplay}>ROOM: {roomCode}</p>
          <input
            type="text"
            placeholder="ENTER YOUR NICKNAME"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className={styles.nameInput}
          />
          <Button onClick={handleSubmit} variant="primary" size="lg" fullWidth>
            JOIN GAME
          </Button>
        </div>
      </div>
      <Footer />
    </HomeContainer>
  );
};
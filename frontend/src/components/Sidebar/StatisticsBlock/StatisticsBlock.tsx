import styles from './StatisticsBlock.module.css';
import catHappyImage from '../../../assets/catHappy.svg';

interface StatisticsBlockProps {
  message?: string;
  imageSrc?: string;
}

export const StatisticsBlock = ({ 
  message = 'Later here will be smth interesting',
  imageSrc = catHappyImage
} : StatisticsBlockProps) => {
  return (
    <div className={styles.statisticsBlock}>
      <div className={styles.placeholderContent}>
        <img src={imageSrc} alt="Cat" className={styles.catImage} />
        <p>{message}</p>
      </div>
    </div>
  );
};
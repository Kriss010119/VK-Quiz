import { Header, Footer, LoadingState } from '../../../components';
import { HomeContainer } from '../HomeContainer';
import { HomeContent } from '../HomeContent';
import styles from './HomePageSkeleton.module.css';

interface HomePageSkeletonProps {
  message?: string;
}

export const HomePageSkeleton = ({ 
  message = "Loading quizzes..." 
} : HomePageSkeletonProps) => {
  return (
    <HomeContainer>
      <HomeContent
        leftColumn={
          <>
            <Header />
            <LoadingState message={message} />
            <Footer />
          </>
        }
        rightColumn={<div className={styles.skeletonSidebar}></div>}
      />
    </HomeContainer>
  );
};
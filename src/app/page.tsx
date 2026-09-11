import { BirthForm } from '../features/birth-input/birth-form';
import * as styles from './page.css';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <BirthForm />
    </main>
  );
}

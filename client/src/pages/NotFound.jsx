import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="narrow">
      <h1>404 - Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Go to the Research Explorer</Link>
    </div>
  );
}

export default NotFound;

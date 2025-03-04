import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = 'primary', fullPage = false }) => {
  const spinnerClasses = `
    spinner 
    spinner-${size} 
    spinner-${color}
    ${fullPage ? 'spinner-fullpage' : ''}
  `;

  return (
    <div className={spinnerClasses.trim()}>
      <div className="spinner-border">
        <span className="visually-hidden">Loading...</span>
      </div>
      {fullPage && <p className="spinner-text">Loading...</p>}
    </div>
  );
};

export default LoadingSpinner; 
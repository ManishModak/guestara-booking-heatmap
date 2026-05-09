export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state-page" role="alert">
      <h1>Bookings could not be loaded</h1>
      <p>{message}</p>
      <button className="today-button" type="button" onClick={onRetry}>Retry</button>
    </div>
  );
}

export default function LoadingState() {
  return (
    <div className="state-page" role="status">
      <div className="loader" aria-hidden="true" />
      <p>Loading bookings...</p>
    </div>
  );
}

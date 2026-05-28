import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your project dashboard.</p>

      <Link to="/project-upload">
        <button>Upload Project</button>
      </Link>
    </div>
  );
}

export default Dashboard;
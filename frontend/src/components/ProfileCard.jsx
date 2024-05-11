import "../styles/Profile.css";
import { useNavigate } from 'react-router-dom';

function ProfileCard({ user }) {
    const navigate = useNavigate();

    const goToUserPage = () => {
        navigate(`/users/${user.email}`);
    };

    return (
        <div className="profile-container"  onClick={goToUserPage}>
            <h3>{user.first_name + user.last_name}</h3>
            <p>{user.email}</p>
        </div>
    );
}

export default ProfileCard;
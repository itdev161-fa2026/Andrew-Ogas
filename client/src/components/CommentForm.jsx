import { useState, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import { createComment } from '../services/api';
import './CommentForm.css';

const CommentForm = ({postId, addComment}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);
    const [commentText, setCommentText] = useState({
        body: '',
    });

    // Handles submission of new comment
    const handleSubmit = async () => {
        try{
            setError(null);
            setLoading(true);
            if (!validateForm()) {
                setLoading(false);
                return;
            }
            const newComment = await createComment(postId, commentText.body);
            await addComment(newComment);
            setCommentText({ ...commentText, body: '' });
            setLoading(false);
        } catch (err) {
            const errorMsg = 
                err.response?.data?.errors?.[0]?.msg ||
                err.response?.data?.msg ||
                'Failed to create comment. Please try again.';
            setError(errorMsg);
            setLoading(false);
        }
    };

    // Validates the comment form before submission
    const validateForm = () => {
        if(!commentText.body.trim()) {
            setError('Comment body is required');
            return false;
        } else if (commentText.body.trim().length > 1000) {
            setError('Comment body cannot exceed 1000 characters');
            return false;
        } else if (!user) {
            setError('You must be logged in to post a comment');
            return false;
        } else if (postId == null) {
            setError('Invalid post ID');
            return false;
        } else if (loading) {
            setError('Comment is already being submitted');
            return false;
        } else {
            setError(null);
            return true;
        }
    };

    return(
        <div className="comment-form">
            {user? 
            <><h2 className="comment-form-header">Add A Comment:</h2>
            <form >
                <textarea
                    className="comment-draft-body"
                    id="body"
                    name="body"
                    value={commentText.body}
                    onChange={(e) => {setCommentText({ ...commentText, body: e.target.value });
                                    setError(null);}}
                    rows="4"
                    placeholder="Write your comment here..."
                />
                <div className="comment-controls">
                    <button type="button" onClick={() => handleSubmit()} className="comment-form-button" disabled={loading}>Submit</button>
                </div>
                {error && <div className="comment-error-message">{error}</div>}
            </form></>
            : <h2 className="comment-form-header">Please log in to post a comment.</h2>}
        </div>
    )
};

export default CommentForm;
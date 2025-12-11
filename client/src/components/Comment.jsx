import { useState, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import { updateComment, deleteComment } from '../services/api';
import './Comment.css';

const Comment = ({comment, removeComment}) => {
    const { user } = useContext(AuthContext);
    const [deleteMode, setDeleteMode] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [edits, setEdits] = useState({
        body: comment.body,
    });
    const [error, setError] = useState(null);
    
    const canEdit = user && comment && user.id === comment.user._id;

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Validation function for edits before submitting
    const validateEdits = () => {
        if (!edits.body.trim()) {
            setError('Comment body cannot be empty.');
            return false;
        }
        if (edits.body === comment.body) {
            setError('No changes made to the comment.');
            return false;
        }
        if (comment.body.length > 1000) {
            setError('Comment body cannot exceed 1000 characters.');
            return false;
        }
        if (comment.user._id !== user.id) {
            setError('You do not have permission to edit this comment.');
            return false;
        }
        return true;
    };

    // Handle edit submission
    const handleEdit = async () => {
        try {
            setError(null);
            if (!validateEdits()) {
                return;
            }
            await updateComment(comment._id, edits.body);
            setEditMode(false);
            comment.body = edits.body;
            comment.lastEdited = new Date().toISOString();
        } catch (err) {
            setError('Failed to edit comment:', err);
        }
    };


    // Handle comment deletion
    const handleDelete = async () => {
        try {
            setError(null);
            await deleteComment(comment._id);
            await removeComment(comment._id);
        } catch (err) {
            setError('Failed to delete comment:', err);
        }
    };


    // Toggle delete confirmation mode
    const toggleDelete = () => {
        setDeleteMode(!deleteMode);
    };

    // Toggle edit mode
    const toggleEdit = () => {
        if (editMode) {
            setEdits({ body: comment.body });
            setError(null);
        }
        setEditMode(!editMode);
    }

    return (
      <div className="comment" >
        {editMode ? 
            <><div className="comment-user">{comment.user.name}</div>
            <div className="comment-date">  {formatDate(comment.createDate)}</div>
            <textarea
                className="edit-comment-textarea"
                value={edits.body}
                onChange={(e) => setEdits({ ...edits, body: e.target.value })}
            />
            <button onClick={handleEdit} className="commit-edit">Save</button>
            <button onClick={toggleEdit} className="cancel-edit">Cancel</button>
            <p className="error-display">{error}</p></>
        : deleteMode ? 
            <><h2 className="delete-warning">Are you sure you want to delete this comment?</h2>
            <p className="comment-body">{comment.body}</p>
            {(comment.lastEdited !== null) &&
            <><div className="last-edited">
                (Last Edited: {formatDate(comment.lastEdited)})
            </div>        
            </>}
            <button onClick={handleDelete} className="real-delete">Yes</button>
            <button onClick={toggleDelete} className="cancel-delete">Cancel</button>
            <p className="error-display">{error}</p></>
        :
            <><div className="comment-user">{comment.user.name}</div>
            <div className="comment-date">  {formatDate(comment.createDate)}</div>
            <p className="comment-body">{comment.body}</p>
            {(comment.lastEdited !== null) &&
            <><div className="last-edited">
                (Last Edited: {formatDate(comment.lastEdited)})
            </div>        
            </>}
            {canEdit && (
            <><button onClick={toggleEdit} className="edit-comment-button">Edit</button>
            <button onClick={toggleDelete} className="delete-comment-button">Delete</button>
            <p className="error-display">{error}</p></>
            )}</>
        }
      </div>
    );
};


export default Comment;
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, deletePost, getCommentsByPostId, deleteCommentsByPostId } from '../services/api';
import { AuthContext } from '../context/authContext';
import CommentForm from '../components/CommentForm';
import Comment from '../components/Comment';
import './PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsVisible, setCommentsVisible] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getPostById(id);
        setPost(data);
        setError(null);
      } catch (err) {
        setError('Failed to load post. It may not exist or the server is down.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  useEffect(() => {
    fetchComments(id);
  }, [id]);

  
  const fetchComments = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const commentData = await getCommentsByPostId(id);
      setComments(commentData);
    } catch (err) {
      setError('Failed to load comments. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exposeComments = () => {
    setCommentsVisible(!commentsVisible);
  };

  const sortComments = () => {
    setComments((prevComments) =>
      [...prevComments].sort((a, b) => new Date(a.createDate) - new Date(b.createDate))
    );
  };

  const addComment = (newComment) => {
    setComments((prevComments) => [...prevComments, newComment]);
    sortComments();
  };

  const removeComment = (commentId) => {
    setComments((prevComments) => prevComments.filter(comment => comment._id !== commentId));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleEdit = () => {
    navigate(`/posts/${id}/edit`);
  };

  const handleDelete = async () => {
    if(window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await deletePost(id);
        await deleteCommentsByPostId(id);
        navigate('/');
      } catch (err) {
        const errorMsg = 
          err.response?.data?.msg ||
          'Failed to delet post. Please try again.';
        alert(errorMsg);
      }
    }
  };

  // Check if current user owns the post
  const canModify = user && post && user.id === post.user._id;

  if (loading) {
    return <div className="container loading">Loading post...</div>;
  }

  if (error) {
    return (
      <div className="container error">
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Home
        </button>
      </div>
    );
  }

  if (!post) {
    return <div className="container error">Post not found.</div>;
  }

  return (
    <div className="container">
      <button onClick={() => navigate('/')} className="back-button">
        ← Back to Posts
      </button>
      <article className="post-detail">
        <h1>{post.title}</h1>
        <div className="post-detail-meta">
          <span className="post-detail-author">By {post.user?.name || 'Unknown'}</span>
          <span className="post-detail-date">{formatDate(post.createDate)}</span>
        </div>
        <div className="post-detail-body">
          {post.body.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        {canModify && (
          <div className="post-actions">
            <button onClick={handleEdit} className="edit-button">
              Edit Post
            </button>
            <button onClick={handleDelete} className="delete-button">
              Delete Post
            </button>
          </div>
        )}
        <div className="comments-section">
          <h2>Comments
            {comments.length > 0 && (
              <span className="comment-count"> ({comments.length})</span>
            )}
            <button onClick={exposeComments} className="expose-comments">{commentsVisible===false? "▼" : "▲"}</button>
          </h2>
          <div className="real-comment-section" style={{ display: commentsVisible ? 'block' : 'none' }}>
            {comments.length === 0 ? (
            <div className="no-comments">
              <p>No Comments Yet</p>
            </div>
            ) : (
              <div className="comments-list">
                {comments.map((comment) => (
                  <Comment key={comment._id} comment={comment} removeComment={removeComment}/>
                ))}
              </div>
            )}
            <CommentForm postId={id} addComment={addComment} />
          </div>
        </div>
      </article>
    </div>
  );
};

export default PostDetail;

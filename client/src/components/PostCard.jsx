import { Link } from 'react-router-dom';
import { getCommentsByPostId } from '../services/api';
import './PostCard.css';
import { useState, useEffect } from 'react';

const PostCard = ({ post }) => {
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric'};
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    const [commentsCount, setCommentsCount] = useState(0);

    // Fetch comments count when component mounts
    useEffect(() => async () => {
        try {
            const comments = await getCommentsByPostId(post._id);
            setCommentsCount(comments.length);
        } catch (err) {
            console.error('Failed to fetch comments count for post:', err);
        }
    }, [post._id]);

    return (
        <div className = "post-card">
            <Link to = {`/posts/${post._id}`} className = "post-card-link">
                <h2>{post.title}</h2>
                <div className="post-meta">
                    <span className="post-author">By {post.user?.name || "unknown"}
                    </span>
                    <span className="post-date">{formatDate(post.createDate)}</span>
                </div>
                <p className="post-preview">
                    {post.body.substring(0, 150)}
                    {post.body.length > 150 ? "..." : ""}
                </p>
                {commentsCount > 0 && (
                    <div className="post-comments-count">
                        ({commentsCount} {commentsCount === 1 ? 'comment)' : 'comments)'}
                    </div>
                )}
                <span className="read-more">Read more →</span>
            </Link>
        </div>
    );
};

export default PostCard;
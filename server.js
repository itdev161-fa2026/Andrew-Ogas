import express from 'express';
import connectDatabase from './config/db.js';
import { check, validationResult } from 'express-validator';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

//load environment variables from .env file
dotenv.config();

// Initialize Express App
const app = express();

//Connect to the database
connectDatabase();

//Configure Middleware
app.use(express.json({ extended: false}));

// API endpoints
app.get('/', (req, res) =>
    res.send('http get request sent to root api endpoint')
);

/**
 * @route POST api/users
 * @desc Register User
 */
app.post('/api/users', [
        check('name', 'Please enter your name').not().isEmpty(),
        check('email', 'Please enter a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {name, email, password} = req.body;

        try{
            //check if user already exists
            let user = await User.findOne({email: email.toLowerCase()});
            if (user) {
                return res.status(400).json({errors: [{ msg: 'User with this email already exists'}]});
            }

            // Create new user instance
            user = new User({
                name,
                email,
                password
            });

            //Hash the passowrd
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            //Save user to database
            await user.save();

            // Create and return JWT
            const payload = {
                user: {
                    id: user.id
                }
            };

            // Generate JWT Token
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                {expiresIn: 360000},
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        msg: 'User registered successfully',
                        token
                    })
                }
            );

        } catch (err) {
            console.error(err.message);
            res.status(500).send('server error');
        }
    }
);

/**
 * @route Post api/auth
 * @desc Login user
 */

app.post('/api/auth', [
    check('email', 'Please include a vaild email').isEmail(),
    check('password', 'Password is required').exists()
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()});
        }

        const {email, password} = req.body;

        try{
            //Check if user exists
            let user =  await User.findOne({ email: email.toLowerCase()});
            if (!user) {
                return res.status(400).json({
                    errors: [{ msg: 'Invalid credentials'}]
                });
            }

            //Verify password
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch) {
                return res.status(400).json({
                    errors: [{ msg: 'Invalid credentials'}]
                });
            }

            //Create JWT payload
            const payload = {
                user: {
                    id: user.id
                }
            };

            //generate JWT Token
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                {expiresIn: 360000},
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        msg: 'User logged in successfully',
                        token
                    });
                }
            );

        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }
    }
)

//Connection listener
app.listen(3000, () => console.log('Express server running on port 3000'));
const express = require('express');
const router = express.Router();
const verifyToken = require('../../Middleware/VerfiyToken');
const { login, getMe } = require('./Auth.controller');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate user and issue JWT
 *     description: |
 *       Validates email/password credentials and returns an access token.
 *       Use this token in the Authorization header as Bearer token for protected endpoints.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginRequest'
 *           examples:
 *             adminLogin:
 *               value:
 *                 email: admin@scm.com
 *                 password: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   $ref: '#/components/schemas/AuthLoginResponseData'
 *               required: [success, message, data]
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               missingCredentials:
 *                 value:
 *                   success: false
 *                   message: Email and password are required.
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               invalidCredentials:
 *                 value:
 *                   success: false
 *                   message: Invalid credentials
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get profile of authenticated user
 *     description: |
 *       Returns currently authenticated user profile extracted from JWT claims.
 *       Allowed Roles:
 *       - Any authenticated user (no role restriction middleware)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AuthUserProfile'
 *               required: [success, data]
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: User referenced by token was not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               userNotFound:
 *                 value:
 *                   success: false
 *                   message: User not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */




router.post('/login', login);
router.get('/me', verifyToken, getMe); // GET /api/auth/me

module.exports = router;
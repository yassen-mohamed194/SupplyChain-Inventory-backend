const express = require('express');
const router = express.Router();
const verifyToken = require('../../Middleware/VerfiyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');
const validate = require('../../Middleware/validate');
const {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  blockPasswordUpdate,
} = require('../../Middleware/validations/users.validation');

const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('./users.controller');

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     description: ADMIN-only endpoint to create a user account.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: User created
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *               required: [success, message, data]
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Validation error
 *                 data:
 *                   type: object
 *               required: [success, message]
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               emailExists:
 *                 value:
 *                   success: false
 *                   message: Email already in use
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   get:
 *     tags: [Users]
 *     summary: List all users
 *     description: ADMIN-only endpoint to retrieve all users, sorted by creation date descending.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *               required: [success, data]
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by id
 *     description: ADMIN-only endpoint to retrieve one user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user.
 *         example: 67f1234567890abcde123456
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *               required: [success, data]
 *       400:
 *         description: Invalid user id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               invalidId:
 *                 value:
 *                   success: false
 *                   message: Invalid user id
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               notFound:
 *                 value:
 *                   success: false
 *                   message: User not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   put:
 *     tags: [Users]
 *     summary: Update user by id
 *     description: |
 *       ADMIN-only endpoint to update user details.
 *       Password updates are blocked on this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   example: User updated
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *               required: [success, message, data]
 *       400:
 *         description: Invalid id, validation failure, or password update attempt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               invalidId:
 *                 value:
 *                   success: false
 *                   message: Invalid user id
 *               passwordBlocked:
 *                 value:
 *                   success: false
 *                   message: Password cannot be updated using this endpoint
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     tags: [Users]
 *     summary: Delete user by id
 *     description: ADMIN-only endpoint to delete a user account.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user.
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: User deleted
 *               required: [success, message]
 *       400:
 *         description: Invalid user id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// ADMIN-only user management
router.use(verifyToken, authorizeRoles('ADMIN'));

router.post('/', validate(createUserSchema), createUser);
router.get('/', getAllUsers);
router.get('/:id', validate(userIdSchema, 'params'), getUserById);
router.put(
  '/:id',
  validate(userIdSchema, 'params'),
  blockPasswordUpdate,
  validate(updateUserSchema),
  updateUser
);
router.delete('/:id', validate(userIdSchema, 'params'), deleteUser);

module.exports = router;
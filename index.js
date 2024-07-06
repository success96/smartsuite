const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Utility functions
const generateToken = (user) => {
  return jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const hashPassword = (password) => {
  return bcrypt.hashSync(password, 8);
};

const validateUser = (user) => {
  const errors = [];
  if (!user.firstName) errors.push({ field: 'firstName', message: 'First name is required' });
  if (!user.lastName) errors.push({ field: 'lastName', message: 'Last name is required' });
  if (!user.email) errors.push({ field: 'email', message: 'Email is required' });
  if (!user.password) errors.push({ field: 'password', message: 'Password is required' });
  return errors;
};

// Routes
app.post('/auth/register', async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  const validationErrors = validateUser(req.body);
  if (validationErrors.length > 0) {
    return res.status(422).json({ errors: validationErrors });
  }

  try {
    const hashedPassword = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
      },
    });

    const organisationName = `${firstName}'s Organisation`;
    const organisation = await prisma.organisation.create({
      data: {
        name: organisationName,
        users: {
          connect: { userId: user.userId },
        },
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    res.status(400).json({ status: 'Bad request', message: 'Registration unsuccessful', statusCode: 400 });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ status: 'Bad request', message: 'Authentication failed', statusCode: 401 });
    }

    const token = generateToken(user);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    res.status(400).json({ status: 'Bad request', message: 'Authentication failed', statusCode: 400 });
  }
});

app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { userId: id },
    });

    if (!user) {
      return res.status(404).json({ status: 'Not found', message: 'User not found', statusCode: 404 });
    }

    if (decoded.userId !== user.userId) {
      return res.status(403).json({ status: 'Forbidden', message: 'Access denied', statusCode: 403 });
    }

    res.status(200).json({
      status: 'success',
      message: 'User retrieved successfully',
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(400).json({ status: 'Bad request', message: 'Error retrieving user', statusCode: 400 });
  }
});

app.get('/api/organisations', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const organisations = await prisma.organisation.findMany({
      where: {
        users: {
          some: {
            userId: decoded.userId,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Organisations retrieved successfully',
      data: {
        organisations,
      },
    });
  } catch (error) {
    res.status(400).json({ status: 'Bad request', message: 'Error retrieving organisations', statusCode: 400 });
  }
});

app.get('/api/organisations/:orgId', async (req, res) => {
  const { orgId } = req.params;
  const token = req.headers.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const organisation = await prisma.organisation.findUnique({
      where: { orgId },
      include: {
        users: true,
      },
    });

    if (!organisation) {
      return res.status(404).json({ status: 'Not found', message: 'Organisation not found', statusCode: 404 });
    }

    const isMember = organisation.users.some((user) => user.userId === decoded.userId);

    if (!isMember) {
      return res.status(403).json({ status: 'Forbidden', message: 'Access denied', statusCode: 403 });
    }

    res.status(200).json({
      status: 'success',
      message: 'Organisation retrieved successfully',
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description,
      },
    });
  } catch (error) {
    res.status(400).json({ status: 'Bad request', message: 'Error retrieving organisation', statusCode: 400 });
  }
});

app.post('/api/organisations', async (req, res) => {
  const { name, description } = req.body;
  const token = req.headers.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const organisation = await prisma.organisation.create({
      data: {
        name,
        description,
        users: {
          connect: { userId: decoded.userId },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Organisation created successfully',
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description,
      },
    });
  } catch (error) {
    res.status(400).json({ status: 'Bad request', message: 'Client error', statusCode: 400 });
  }
});

app.post('/api/organisations/:orgId/users', async (req, res) => {
  const { orgId } = req.params;
  const { userId } = req.body;
  const token = req.headers.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const organisation = await prisma.organisation.findUnique({
      where: { orgId },
      include: {
        users: true,
      },
    });

    if (!organisation) {
      return res.status(404).json({ status: 'Not found', message: 'Organisation not found', statusCode: 404 });
    }

    const isCreator = organisation.users.some((user) => user.userId === decoded.userId);

    if (!isCreator) {
      return res.status(403).json({ status: 'Forbidden', message: 'Access denied', statusCode: 403 });
    }

    await prisma.organisation.update({
      where: { orgId },
      data: {
        users: {
          connect: { userId },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'User added to organisation successfully',
    });
  } catch (error) {
    res.status(400).json({ status: 'Bad request', message: 'Client error', statusCode: 400 });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

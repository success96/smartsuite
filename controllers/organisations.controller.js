const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

exports.createOrg = async (req, res) => {
    //this function creates a new organisation
  try {
    const { name, description } = req.body;
    const token = req.headers.authorization.split(' ')[1];

    if (!name) return res.status(422).json({field: 'name', message: 'Name is required'});

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
}

exports.createOrgUser = async (req, res) => {
    //this function adds a new user to an organisation
  try {
    const { orgId } = req.params;
    const { userId } = req.body;
    const token = req.headers.authorization.split(' ')[1];


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
}
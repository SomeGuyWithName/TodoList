var express = require('express');
var router = express.Router();


module.exports = (mongoose) => {
  const ObjectId = mongoose.Types.ObjectId;
  const User = mongoose.model('users', new mongoose.Schema({ name: String, phone: String }, {versionKey: false}));

  router.get('/', async function (req, res) {    
    const { page = 1, limit = 5, sortBy = '_id', sortMode = 'desc', query = '' } = req.query;    
    try {
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const filter = query ? { $or : [{ name: { $regex: query, $options: 'i' } }, { phone: { $regex: query, $options: 'i' } } ] } : {};
      const total = await User.countDocuments(filter);      
      const pages = Math.ceil(total / parseInt(limit));
      const rows = await User.find(filter).sort({ [sortBy]: sortMode === 'asc' ? 1 : -1 }).limit(parseInt(limit)).skip(offset);

      res.status(200).json({
        data: rows,
        total,
        pages,
        page,
        limit,
        offset
      })
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json('Internal Server Error');
    }
  });

  // middleware form user
  const userValidation = (req, res, next) => {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json('Name and phone are required');
    }
    if (typeof name !== 'string' || typeof phone !== 'string') {
      return res.status(400).json('Name and phone must be strings');
    }
    if (name.trim() === '' || phone.trim() === '') {
      return res.status(400).json('Name and phone cannot be empty');
    }
    next();
  }

  // ADD USERS
  router.post('/', userValidation, async (req, res) => {
    try{
      const {name, phone} = req.body;
      const result = await User.create({ name, phone });
      res.status(201).json({"_id": result._id, "name": result.name, "phone": result.phone});
    } catch (error) {
      console.error('Error adding user:', error);
      res.status(500).json('Internal Server Error');
    }
  });

  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await User.findOne({ _id: new ObjectId(id) });
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json('Internal Server Error');
    }
  })

  router.put('/:id',  async (req, res) => {
    try{
      const {name, phone} = req.body;
      await User.updateOne({_id: new ObjectId(req.params.id)}, {$set: {name, phone}});
      res.status(201).json({"_id": req.params.id, name, phone});
    } catch (error) {
      console.error('Error editing user:', error);
      res.status(500).json('Internal Server Error');
    }
  });

  router.delete('/:id',  async (req, res) => {
    const { id } = req.params;
    try{
      const result = await User.findOne({ _id: new ObjectId(id) });
      await User.deleteOne({_id: new ObjectId(id)});
      res.status(201).json(result);
    } catch (error) {
      console.error('Error editing user:', error);
      res.status(500).json('Internal Server Error');
    }
  });
  
  // router.get('/:id', async (req, res) => {
  //   try {
  //     const user = await mongoose.collection('users').findOne({ _id: new ObjectId(req.params.id) });
  //     console.log('ini data add:', user);
      
  //     res.status(200).json(user);
  //   } catch (error) {
  //     console.error('Error fetching user:', error);
  //     res.status(500).json('Internal Server Error');
  //   }
  // })
     
  // UPDATE 
  // router.put('/:id', async (req, res) => {
  //   try {
  //     const user = await mongoose.collection('users').updateOne({ _id: new ObjectId(req.params.id) }, { $set: name, phone });
  // } catch (error) {
  //   console.error('Error updating user:', error);
  //   res.status(500).json('Internal Server Error');
  // }
  // });

  // router.post('/', async function (req, res) {
  //   try {
  //     const { name, phone } = req.body;
  //     // const result = await response.json();
  //     console.log(`Name: ${name}, Phone: ${phone}`);
  //     readData();
  //   } catch (error) {
  //     console.error('Error creating user:', error);
  //     res.status(500).json('Internal Server Error');
  //   }
  // });


  // router.put('/:id', async function (req, res) {
  //   try {
  //     await db.collection('users').updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
  //     res.status(200).json('User updated successfully');
  //   } catch (error) {
  //     console.error('Error updating user:', error);
  //     res.status(500).json('Internal Server Error');
  //   }
  // });

  // router.delete('/:id', async function (req, res) {
  //   try {
  //     await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
  //     res.status(200).json('User deleted successfully');
  //   } catch (error) {
  //     console.error('Error deleting user:', error);
  //     res.status(500).json('Internal Server Error');
  //   }
  // });

  return router;
}

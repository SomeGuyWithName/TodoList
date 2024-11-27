var express = require('express');
var router = express.Router();

module.exports = (connDb) => {
  router.get('/', async function (req, res) {
    try {
      const page = parseInt(page) || 1;
      const limit = parseInt(limit) || 5;
      const offset = (page - 1) * limit;
      const sortBy = req.query.sortBy || 'id';
      const sortMode = req.query.sortMode || 'asc';
      const query = req.query.search || '';

      const total = await connDb.collection('users').countDocuments({ name: { $regex: query, $options: 'i' } });
      const pages = Math.ceil(total / limit);
      const rows = await connDb.collection('users')
        .find({ name: { $regex: query, $options: 'i' } })
        .sort({ [sortBy]: sortMode === 'asc' ? 1 : -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      res.status(200).json({
        data: rows[0],
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
     
 
 
  // router.post('/:id', async function (req, res) {
  //   try {
  //     const { name, phone } = req.body;
  //     const response = await fetch('http://localhost:3000/users', {
  //       method: 'POST',
  //       body: JSON.stringify({ name, phone })
  //     });
  //     const result = await response.json();
  //     console.log('ini data add:',name, result);
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

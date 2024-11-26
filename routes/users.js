var express = require('express');
const { read } = require('fs');
var router = express.Router();
const path = require('path');

  router.get('/', async function (req, res) {
    const { page = 1, limit = 5, query = '', sortBy = 'id', sortMode = 'desc' } = req.query;
    console.log(page, limit, query, sortBy, sortMode);
    
    
    try {
      const offset = (page - 1) * (parseInt(limit) || 5);
      const search = query ? {
        $or: [
          {name: new RegExp(query, 'i')}, {phone: new RegExp(query, 'i' )}],
      } : {};
      
      const data = await db.collection('users').find(search).sort({ [sortBy]: sortMode === 'asc' ? 1 : -1 }).skip(offset).limit(parseInt(limit)).toArray();
      res.render('list', { data });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json('Internal Server Error');
    }
  });
 
  router.post('/:id', async function (req, res) {
    try {
      const { name, phone } = req.body;
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        body: JSON.stringify({ name, phone })
      });
      const result = await response.json();
      console.log('ini data add:',name, result);
      readData();
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json('Internal Server Error');
    }
  });


  router.put('/:id', async function (req, res) {
    try {
      await db.collection('users').updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
      res.status(200).json('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json('Internal Server Error');
    }
  });

  router.delete('/:id', async function (req, res) {
    try {
      await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
      res.status(200).json('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json('Internal Server Error');
    }
  });


  router.get('/', (req, res) => {
    res.render('list');
  });



module.exports = router;


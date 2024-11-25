const { name } = require('ejs');
var express = require('express');
var router = express.Router();
const path = require('path');

  router.get('/', async function (req, res) {
    const { page = 1, limit = 5, query = '', sortBy = 'id', sortMode = 'desc' } = req.query;
    
    try {
      const offset = (page - 1) * limit;
      const search ={
        $or: [
        {name: new RegExp(query, 'i')}, {phone: new RegExp(query, 'i' )}],
      }

     
      res.status(200).json({
        title: 'MongoDB BREADS(Browse, Read, Edit, Add, Delete, Sorting)',
        offset,
        search,
        limit,
        query,
        sortBy,
        sortMode
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json('Internal Server Error');
    }
  });

module.exports = router;


var exports = module.exports = {};

exports.getInitialColumns = function (next) {
  next([
    {
      name: 'Name',
      dataIndex: 'name',
      width: '50%'
    }, {
      name: 'Age',
      dataIndex: 'age',
      width: '50%'
    }
  ]);
};

exports.getInitialData = function (next) {
  next([
    {
      name: 'Michael Jordan',
      age: '20'
    },
    {
      name: 'Charles Barkley',
      age: '47'
    },
    {
      name: 'Ingo',
      age: '25'
    }
  ]);
};

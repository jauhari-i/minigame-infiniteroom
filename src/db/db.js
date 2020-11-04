module.exports = (mongoose) => {
  mongoose.connect(
    process.env.mode === 'dev' ? 'mongodb://localhost:27017/minigames' : process.env.MONGO_URL,
    {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (err) => {
      if (err) {
        console.error(err);
        console.log('Failed to connect database');
      } else {
        console.log('Connected to database');
      }
    }
  );
};

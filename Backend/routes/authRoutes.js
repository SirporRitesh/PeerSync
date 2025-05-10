const email = req.body.email.trim().toLowerCase();
const existingUser = await User.findOne({ email });
if (existingUser) {
  return res.status(400).json({ message: 'Email already exists' });
}
// ...when creating user:
const user = new User({ ...otherFields, email });
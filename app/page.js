'use client';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Container, MenuItem, Select } from '@mui/material';
import { firestore } from '@/firebase';
import { doc, query, collection, getDocs, addDoc, updateDoc, deleteDoc, setDoc, deleteDoc as firebaseDeleteDoc } from 'firebase/firestore';
import darkTheme from '@/theme/theme'; // Adjust the import path accordingly

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState({ id: '', name: '', count: 0, expirationDate: '' });
  const [categories, setCategories] = useState(['Diary', 'Frozen Foods', 'Drinks', 'Canned Food', 'supplements']);
  const [selectedCategory, setSelectedCategory] = useState('Category1');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [newCategory, setNewCategory] = useState(''); // State for new category input
  const [showCategoryDialog, setShowCategoryDialog] = useState(false); // State for category dialog
  const [editingCategory, setEditingCategory] = useState(''); // State for editing category
  const [showEditCategoryDialog, setShowEditCategoryDialog] = useState(false); // State for editing category dialog

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory', selectedCategory, 'items'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    checkAlerts(inventoryList);
  };

  const checkAlerts = (items) => {
    const now = new Date();
    const newAlerts = items.filter(item => {
      const expirationDate = new Date(item.expirationDate);
      return expirationDate <= now.setDate(now.getDate() + 7) && item.count < 10; // Alert for items expiring in 7 days or less and low count
    });
    setAlerts(newAlerts);
  };

  const handleSave = async () => {
    if (currentItem.id) {
      const itemDoc = doc(firestore, 'inventory', selectedCategory, 'items', currentItem.id);
      await updateDoc(itemDoc, { name: currentItem.name, count: currentItem.count, expirationDate: currentItem.expirationDate });
    } else {
      await addDoc(collection(firestore, 'inventory', selectedCategory, 'items'), { name: currentItem.name, count: currentItem.count, expirationDate: currentItem.expirationDate });
    }
    setOpen(false);
    updateInventory();
  };

  const handleDelete = async (id) => {
    const itemDoc = doc(firestore, 'inventory', selectedCategory, 'items', id);
    await deleteDoc(itemDoc);
    updateInventory();
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setOpen(true);
  };

  const handleAdd = () => {
    setCurrentItem({ id: '', name: '', count: 0, expirationDate: '' });
    setOpen(true);
  };

  const handleCategoryAdd = async () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      await setDoc(doc(firestore, 'inventory', newCategory), {}); // Create a new collection for the new category
      setNewCategory('');
      setShowCategoryDialog(false);
    }
  };

  const handleCategoryEdit = async () => {
    if (editingCategory && !categories.includes(editingCategory)) {
      const updatedCategories = categories.map(cat => cat === selectedCategory ? editingCategory : cat);
      setCategories(updatedCategories);
      await setDoc(doc(firestore, 'inventory', editingCategory), {}); // Create a new collection for the edited category
      await firebaseDeleteDoc(doc(firestore, 'inventory', selectedCategory)); // Delete the old category
      setSelectedCategory(editingCategory);
      setEditingCategory('');
      setShowEditCategoryDialog(false);
    }
  };

  const handleCategoryDelete = async (category) => {
    if (window.confirm(`Are you sure you want to delete the category "${category}"?`)) {
      setCategories(categories.filter(cat => cat !== category));
      await firebaseDeleteDoc(doc(firestore, 'inventory', category)); // Delete the category from Firebase
      if (selectedCategory === category) {
        setSelectedCategory(categories[0] || ''); // Reset selected category if it's deleted
      }
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!filterCategory || item.category === filterCategory)
  );

  useEffect(() => {
    updateInventory();
  }, [selectedCategory]);

  return (
    <ThemeProvider theme={darkTheme}>
      <Container sx={{ 
        background: 'linear-gradient(to left, #00aaff, #ffb3b3)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Box>
          <Typography variant="h1"> DigitalKitchen</Typography>

          <Box sx={{ display: 'flex', gap: 2, margin: 2 }}>
            <TextField
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', margin: 2 }}>
            {categories.map((category) => (
              <Box 
                key={category} 
                sx={{ 
                  width: 200, 
                  height: 200, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: '#ff66b2', // Complimenting color
                  borderRadius: 2, 
                  boxShadow: 3, 
                  transition: 'transform 0.3s ease',
                  position: 'relative', // Added for absolute positioning of delete button
                  '&:hover': { 
                    transform: 'translateY(-10px)', 
                    backgroundColor: '#ff80ab',
                    cursor: 'pointer' 
                  } 
                }} 
                onClick={() => setSelectedCategory(category)}
              >
                <Typography>{category}</Typography>
                <Button 
                  sx={{ position: 'absolute', top: 8, right: 8 }} 
                  variant="outlined" 
                  color="error" 
                  onClick={(e) => { 
                    e.stopPropagation(); // Prevent category selection on button click
                    handleCategoryDelete(category);
                  }}
                >
                  Delete
                </Button>
              </Box>
            ))}
          </Box>

          <Button variant="contained" color="primary" onClick={handleAdd}>
            Add Item
          </Button>
          <Button variant="contained" color="secondary" onClick={() => setShowCategoryDialog(true)}>
            Add Category
          </Button>

          {alerts.length > 0 && (
            <Box sx={{ backgroundColor: '#ffcccc', padding: 2, borderRadius: 1, margin: 2 }}>
              <Typography variant="h6">Alerts:</Typography>
              {alerts.map((item, index) => (
                <Typography key={index}>{item.name} is expiring soon or low in stock!</Typography>
              ))}
            </Box>
          )}

          <Box sx={{ marginTop: 2 }}>
            {filteredInventory.map((item, index) => (
              <Box key={item.id} sx={{ marginBottom: 2, backgroundColor: '#ffffff', padding: 2, borderRadius: 1, boxShadow: 2 }}>
                <Typography variant="h6">{index + 1}. {item.name}</Typography>
                <Typography>Count: {item.count}</Typography>
                <Typography>Expiration Date: {item.expirationDate}</Typography>
                <Button variant="outlined" onClick={() => handleEdit(item)}>Edit</Button>
                <Button variant="outlined" color="error" onClick={() => handleDelete(item.id)}>Delete</Button>
              </Box>
            ))}
          </Box>

          <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>{currentItem.id ? 'Edit Item' : 'Add Item'}</DialogTitle>
            <DialogContent>
              <TextField
                label="Name"
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Count"
                type="number"
                value={currentItem.count}
                onChange={(e) => setCurrentItem({ ...currentItem, count: parseInt(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Expiration Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={currentItem.expirationDate}
                onChange={(e) => setCurrentItem({ ...currentItem, expirationDate: e.target.value })}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={showCategoryDialog} onClose={() => setShowCategoryDialog(false)}>
            <DialogTitle>Add Category</DialogTitle>
            <DialogContent>
              <TextField
                label="Category Name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowCategoryDialog(false)}>Cancel</Button>
              <Button onClick={handleCategoryAdd}>Add</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={showEditCategoryDialog} onClose={() => setShowEditCategoryDialog(false)}>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogContent>
              <TextField
                label="New Category Name"
                value={editingCategory}
                onChange={(e) => setEditingCategory(e.target.value)}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowEditCategoryDialog(false)}>Cancel</Button>
              <Button onClick={handleCategoryEdit}>Save</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

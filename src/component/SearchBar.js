import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';

const SearchBar = ({ onSearch }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = () => {
    onSearch(searchInput);
  };

  return (
    <div>
      <TextField
        label="Digite um sobrenome"
        variant="outlined"
        value={searchInput}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSearch();
        }}
      />
      <Button variant="contained" onClick={handleSearch}>
        Pesquisar
      </Button>
    </div>
  );
};

export default SearchBar;
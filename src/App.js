import React, { useState, useMemo } from 'react';
import { TextField, List, ListItem, ListItemText, Divider } from '@mui/material';
import './App.css';
import logo from './f1logo.png';

const SearchContext = React.createContext();

const App = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    setSearchInput(inputValue);
    setError('');
    handleSearch(inputValue);
  };

  const handleSearch = (inputValue) => {
    if (inputValue === '') {
      setError('Por favor, digite um sobrenome.');
      setSearchResults([]);
      return;
    }

    const url = `https://ergast.com/api/f1/drivers.json?limit=859`;
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao buscar dados');
        }
        return response.json();
      })
      .then(data => {
        displayResults(data, inputValue);
      })
      .catch(error => {
        console.error('Erro ao buscar dados:.', error);
      });
  };

  const displayResults = (data, inputValue) => {
    const drivers = data.MRData.DriverTable.Drivers;

    const filteredDrivers = drivers.filter(driver => {
      return (
        (driver.driverId && driver.familyName.toLowerCase().startsWith(inputValue.toLowerCase())) ||
        driver.givenName.toLowerCase().startsWith(inputValue.toLowerCase())
      );
    });

    if (filteredDrivers.length > 0) {
      setSearchResults(filteredDrivers);
      setError('');
    } else {
      setSearchResults([]);
      setError('Nenhum resultado encontrado.');
    }
  };

  const memoizedResults = useMemo(() => searchResults, [searchResults]);

  return (
    <SearchContext.Provider value={{ searchInput, setSearchInput, searchResults, setSearchResults, error }}>
      <div>
        <div className="Title">
          <img src={logo} alt="Logo" />
        </div>
        <div className="busca">
          <TextField
            label="Digite um sobrenome..."
            variant="outlined"
            value={searchInput}
            onChange={handleInputChange}
            error={error !== ''}
            helperText={error}
          />
          <div className="campos">
            <strong>Nome</strong>
            <strong>Nascimento</strong>
            <strong>Nacionalidade</strong>
            <strong>Wikipedia</strong>
          </div>
        </div>
        <div id="results">
          <List>
            {memoizedResults.length > 0 ? (
              memoizedResults.map((driver, index) => (
                <div key={index}>
                  <ListItem>
                    <ListItemText primary={`${driver.givenName} ${driver.familyName}`} />
                    <ListItemText primary={driver.dateOfBirth} />
                    <ListItemText primary={driver.nationality} />
                    <ListItemText>
                      <a href={driver.url}>Saiba Mais</a>
                    </ListItemText>
                  </ListItem>
                  {index !== memoizedResults.length - 1 && <Divider />}
                </div>
              ))
            ) : (
              <p>{error || 'Nenhum resultado encontrado.'}</p>
            )}
          </List>
        </div>
      </div>
    </SearchContext.Provider>
  );
};

export default App;
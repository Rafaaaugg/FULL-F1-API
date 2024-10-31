import React, { useState, useMemo } from 'react';
import { TextField, List, ListItem, Divider, Avatar } from '@mui/material';
import './App.css';
import logo from './f1logo.png';

const SearchContext = React.createContext();

const App = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [driverImages, setDriverImages] = useState({});

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

    const limit = 100;
    let offset = 0;
    const totalDrivers = [];

    const fetchAllDrivers = () => {
      const url = `https://ergast.com/api/f1/drivers.json?limit=${limit}&offset=${offset}`;
      return fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error('Erro ao buscar dados');
          }
          return response.json();
        })
        .then(data => {
          totalDrivers.push(...data.MRData.DriverTable.Drivers);

          if (data.MRData.DriverTable.Drivers.length === limit) {
            offset += limit;
            return fetchAllDrivers();
          } else {
            displayResults(totalDrivers, inputValue);
          }
        })
        .catch(error => {
          console.error('Erro ao buscar dados:', error);
        });
    };

    fetchAllDrivers();
  };

  const fetchDriverImage = (driverId, wikiTitle) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${wikiTitle}&prop=pageimages&format=json&pithumbsize=200&origin=*`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        const thumbnail = pages[pageId].thumbnail ? pages[pageId].thumbnail.source : null;

        if (thumbnail) {
          setDriverImages(prevImages => ({
            ...prevImages,
            [driverId]: thumbnail
          }));
        }
      })
      .catch(error => {
        console.error('Erro ao buscar imagem do Wikipedia:', error);
      });
  };

  const displayResults = (drivers, inputValue) => {
    const filteredDrivers = drivers.filter(driver => {
      return (
        (driver.driverId && driver.familyName.toLowerCase().startsWith(inputValue.toLowerCase())) ||
        driver.givenName.toLowerCase().startsWith(inputValue.toLowerCase())
      );
    });

    filteredDrivers.forEach(driver => {
      const wikiTitle = driver.url.split('/').pop(); // Obtém o título da página da URL
      fetchDriverImage(driver.driverId, wikiTitle);
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
              <strong>Foto</strong>
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
                    <ListItem style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        alt={driver.familyName}
                        src={driverImages[driver.driverId]}
                        style={{ width: '80px', height: '80px', marginRight: '10px' }}
                      />
                      <div style={{ flex: '1', display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: '1', textAlign: 'center' }}>{`${driver.givenName} ${driver.familyName}`}</div>
                        <div style={{ flex: '1', textAlign: 'center' }}>{driver.dateOfBirth}</div>
                        <div style={{ flex: '1', textAlign: 'center' }}>{driver.nationality}</div>
                        <div style={{ flex: '1', textAlign: 'center' }}>
                          <a href={driver.url} target="_blank" rel="noopener noreferrer">Saiba Mais</a>
                        </div>
                      </div>
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

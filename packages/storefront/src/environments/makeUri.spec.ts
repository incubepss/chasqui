import { makeUri } from './makeUri';

describe('Make Uri endpoint to backend service', () => {
  it('without host and port', () => {
    const uri = makeUri({
      apiHost: '',
      apiPort: 0,
      shopApiPath: 'shop-api',
    });
    expect(uri).toEqual(`http://localhost:${location.port}/shop-api`);
  });

  it('with host and port', () => {
    const uri = makeUri({
      apiHost: 'https://api.somedomain',
      apiPort: 443,
      shopApiPath: 'the-shop-api',
    });
    expect(uri).toEqual(`https://api.somedomain:443/the-shop-api`);
  });
});

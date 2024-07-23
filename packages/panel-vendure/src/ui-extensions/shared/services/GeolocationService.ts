import { Injectable } from '@angular/core';
import axios from 'axios';

/***
 * DOCS ref:  https://nominatim.org/release-docs/develop/api/Search/
 */

const objectToParam = data => {
  return Object.keys(data)
    .filter(function (key) {
      return data[key] ? true : false;
    })
    .map(function (key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
    })
    .join('&');
};

export type ResponsePoint = {
  place_id: number;
  boundingbox: Array<string>;
  class: 'boundary' | 'place';
  display_name: string;
  lat: string; // '-39.0266276';
  lon: string; // '-67.5754863';
};

@Injectable()
export class GeolocationService {
  searchQuery(query: string): Promise<Array<ResponsePoint>> {
    const params = {
      q: query,
      format: 'json',
      limit: 3,
    };
    return axios.get('https://nominatim.openstreetmap.org/search?' + objectToParam(params)).then(response => {
      return response.data;
    });
  }
}

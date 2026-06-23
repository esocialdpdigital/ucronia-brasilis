/**
 * capitanias_1534_geojson.js
 * 
 * Coordenadas geográficas reais (longitude, latitude) aproximadas das Capitanias Hereditárias (1534).
 * Usado com D3.js para projeção geográfica real do mapa.
 */

export const capitaniasGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "maranhao",
      "properties": { 
        "name": "Capitania do Maranhão",
        "port_coords": [-44.0, -2.5]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-48.6, -1.0],
          [-48.6, 0.5],
          [-50.0, 0.0],
          [-46.0, -1.2],
          [-41.8, -2.7],
          [-48.6, -2.7],
          [-48.6, -1.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "ceara",
      "properties": { 
        "name": "Capitania do Ceará",
        "port_coords": [-38.5, -3.7]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-48.6, -2.7],
          [-41.8, -2.7],
          [-38.5, -3.7],
          [-48.6, -3.7],
          [-48.6, -2.7]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "rio_grande",
      "properties": { 
        "name": "Capitania do Rio Grande",
        "port_coords": [-35.3, -5.1]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-48.6, -3.7],
          [-38.5, -3.7],
          [-35.3, -5.1],
          [-34.9, -6.7],
          [-48.6, -6.7],
          [-48.6, -3.7]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "itamaraca",
      "properties": { 
        "name": "Capitania de Itamaracá",
        "port_coords": [-34.8, -7.8]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-48.6, -6.7],
          [-34.9, -6.7],
          [-34.8, -7.8],
          [-48.6, -7.8],
          [-48.6, -6.7]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "pernambuco",
      "properties": { 
        "name": "Capitania de Pernambuco",
        "port_coords": [-34.9, -8.1]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-48.6, -7.8],
          [-34.8, -7.8],
          [-34.9, -8.1],
          [-36.4, -10.5],
          [-48.6, -10.5],
          [-48.6, -7.8]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "bahia",
      "properties": { 
        "name": "Capitania da Baía de Todos os Santos",
        "port_coords": [-38.5, -13.0]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-48.6, -10.5],
          [-36.4, -10.5],
          [-38.5, -13.0],
          [-39.0, -15.6],
          [-48.6, -15.6],
          [-48.6, -10.5]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "ilheos",
      "properties": { 
        "name": "Capitania de Ilhéus",
        "port_coords": [-39.0, -14.8]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-48.6, -15.6],
          [-39.0, -15.6],
          [-39.2, -18.0],
          [-48.6, -18.0],
          [-48.6, -15.6]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "porto_seguro",
      "properties": { 
        "name": "Capitania de Porto Seguro",
        "port_coords": [-39.1, -16.4]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-48.6, -18.0],
          [-39.2, -18.0],
          [-40.3, -21.3],
          [-48.6, -21.3],
          [-48.6, -18.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "espirito_santo",
      "properties": { 
        "name": "Capitania do Espírito Santo",
        "port_coords": [-40.3, -20.3]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-48.6, -21.3],
          [-40.3, -21.3],
          [-41.8, -22.4],
          [-48.6, -22.4],
          [-48.6, -21.3]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "sao_tome",
      "properties": { 
        "name": "Capitania de São Tomé",
        "port_coords": [-41.3, -22.0]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-48.6, -22.4],
          [-41.8, -22.4],
          [-43.2, -22.9],
          [-46.1, -23.8],
          [-48.6, -23.8],
          [-48.6, -22.4]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "sao_vicente",
      "properties": { 
        "name": "Capitania de São Vicente",
        "port_coords": [-46.3, -24.0]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-48.6, -23.8],
          [-46.1, -23.8],
          [-47.9, -25.0],
          [-48.5, -25.5],
          [-48.6, -25.5],
          [-48.6, -23.8]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "santo_amaro",
      "properties": { 
        "name": "Capitania de Santo Amaro e Santana",
        "port_coords": [-48.0, -25.2]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-48.6, -25.5],
          [-48.5, -25.5],
          [-48.8, -28.5],
          [-48.6, -28.5],
          [-48.6, -25.5]
        ]]
      }
    }
  ]
};

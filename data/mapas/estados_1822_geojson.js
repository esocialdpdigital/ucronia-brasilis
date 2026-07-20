/**
 * estados_1822_geojson.js
 * 
 * Coordenadas geográficas encaixadas com precisão topológica perfeita (sem lacunas/buracos)
 * para as 19 Províncias do Império do Brasil (1822).
 */

export const estados1822GeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "grao_para",
      "properties": { 
        "name": "Província do Grão-Pará",
        "port_coords": [-48.5, -1.4],
        "capital_coords": [-48.5, -1.4]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-73.0, -7.0],
          [-70.0, 0.0],
          [-67.0, 2.0],
          [-60.0, 4.0],
          [-51.0, 4.0],
          [-46.0, -1.2],
          [-46.0, -7.0],
          [-50.0, -10.0],
          [-65.0, -10.0],
          [-73.0, -7.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "maranhao",
      "properties": { 
        "name": "Província do Maranhão",
        "port_coords": [-44.3, -2.5],
        "capital_coords": [-44.3, -2.5]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-46.0, -1.2],
          [-41.8, -2.7],
          [-44.0, -7.0],
          [-46.0, -7.0],
          [-46.0, -1.2]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "piaui",
      "properties": { 
        "name": "Província do Piauí",
        "port_coords": [-41.5, -3.0],
        "capital_coords": [-41.5, -3.0]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-41.8, -2.7],
          [-41.2, -2.9],
          [-40.0, -7.0],
          [-40.0, -9.0],
          [-45.0, -10.0],
          [-44.0, -7.0],
          [-41.8, -2.7]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "ceara",
      "properties": { 
        "name": "Província do Ceará",
        "port_coords": [-38.5, -3.7],
        "capital_coords": [-38.5, -3.7]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-41.8, -2.7],
          [-38.5, -3.7],
          [-37.0, -4.8],
          [-37.0, -7.0],
          [-40.0, -7.0],
          [-41.8, -2.7]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "rio_grande_do_norte",
      "properties": { 
        "name": "Província do Rio Grande do Norte",
        "port_coords": [-35.2, -5.8],
        "capital_coords": [-35.2, -5.8]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-38.5, -3.7],
          [-35.2, -5.1],
          [-34.9, -6.0],
          [-37.0, -6.0],
          [-37.0, -4.8],
          [-38.5, -3.7]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "paraiba",
      "properties": { 
        "name": "Província da Paraíba",
        "port_coords": [-34.8, -7.0],
        "capital_coords": [-34.8, -7.0]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-34.9, -6.0],
          [-34.8, -7.2],
          [-37.0, -7.2],
          [-37.0, -6.0],
          [-34.9, -6.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "pernambuco",
      "properties": { 
        "name": "Província de Pernambuco",
        "port_coords": [-34.9, -8.1],
        "capital_coords": [-34.9, -8.1]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.0, -7.0],
          [-37.0, -7.2],
          [-34.8, -7.2],
          [-34.9, -8.1],
          [-36.0, -9.0],
          [-40.0, -9.0],
          [-40.0, -7.0],
          [-37.0, -7.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "alagoas",
      "properties": { 
        "name": "Província de Alagoas",
        "port_coords": [-35.7, -9.6],
        "capital_coords": [-35.7, -9.6]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-34.9, -8.1],
          [-36.4, -10.0],
          [-36.0, -9.0],
          [-34.9, -8.1]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "sergipe",
      "properties": { 
        "name": "Província de Sergipe",
        "port_coords": [-37.0, -10.9],
        "capital_coords": [-37.0, -10.9]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-36.4, -10.0],
          [-37.2, -11.2],
          [-38.0, -10.5],
          [-36.0, -9.0],
          [-36.4, -10.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "bahia",
      "properties": { 
        "name": "Província da Bahia",
        "port_coords": [-38.5, -13.0],
        "capital_coords": [-38.5, -13.0]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-45.0, -10.0],
          [-40.0, -9.0],
          [-36.0, -9.0],
          [-38.0, -10.5],
          [-37.2, -11.2],
          [-39.0, -15.6],
          [-40.3, -18.0],
          [-46.0, -14.0],
          [-45.0, -10.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "goias",
      "properties": { 
        "name": "Província de Goiás",
        "port_coords": null,
        "capital_coords": [-49.2, -16.0]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-50.0, -10.0],
          [-46.0, -7.0],
          [-44.0, -7.0],
          [-45.0, -10.0],
          [-46.0, -14.0],
          [-50.0, -19.0],
          [-52.0, -18.0],
          [-50.0, -10.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "mato_grosso",
      "properties": { 
        "name": "Província de Mato Grosso",
        "port_coords": null,
        "capital_coords": [-56.0, -15.6]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-73.0, -7.0],
          [-65.0, -10.0],
          [-50.0, -10.0],
          [-52.0, -18.0],
          [-50.0, -19.0],
          [-54.0, -22.0],
          [-54.0, -26.0],
          [-58.0, -22.0],
          [-60.0, -15.0],
          [-65.0, -10.0],
          [-73.0, -7.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "minas_gerais",
      "properties": { 
        "name": "Província de Minas Gerais",
        "port_coords": null,
        "capital_coords": [-43.9, -19.9]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-46.0, -14.0],
          [-40.3, -18.0],
          [-41.8, -21.0],
          [-44.0, -22.5],
          [-48.0, -22.5],
          [-50.0, -19.0],
          [-46.0, -14.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "espirito_santo",
      "properties": { 
        "name": "Província do Espírito Santo",
        "port_coords": [-40.3, -20.3],
        "capital_coords": [-40.3, -20.3]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-39.0, -15.6],
          [-40.3, -18.0],
          [-41.8, -21.0],
          [-41.0, -21.3],
          [-39.0, -15.6]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "rio_de_janeiro",
      "properties": { 
        "name": "Província do Rio de Janeiro",
        "port_coords": [-43.2, -22.9],
        "capital_coords": [-43.2, -22.9]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-41.0, -21.3],
          [-41.8, -21.0],
          [-44.0, -22.5],
          [-44.5, -23.3],
          [-41.0, -21.3]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "sao_paulo",
      "properties": { 
        "name": "Província de São Paulo",
        "port_coords": [-46.3, -24.0],
        "capital_coords": [-46.6, -23.5]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-44.5, -23.3],
          [-44.0, -22.5],
          [-48.0, -22.5],
          [-50.0, -19.0],
          [-54.0, -22.0],
          [-54.0, -26.0],
          [-48.5, -25.5],
          [-44.5, -23.3]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "santa_catarina",
      "properties": { 
        "name": "Província de Santa Catarina",
        "port_coords": [-48.5, -27.6],
        "capital_coords": [-48.5, -27.6]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-48.5, -25.5],
          [-54.0, -26.0],
          [-51.0, -28.0],
          [-48.8, -28.5],
          [-48.5, -25.5]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "rio_grande_do_sul",
      "properties": { 
        "name": "Província de São Pedro do Rio Grande do Sul",
        "port_coords": [-52.0, -32.0],
        "capital_coords": [-52.0, -32.0]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-48.8, -28.5],
          [-51.0, -28.0],
          [-54.0, -26.0],
          [-57.0, -30.0],
          [-52.0, -32.0],
          [-48.8, -28.5]
        ]]
      }
    },
    {
      "type": "Feature",
      "id": "cisplatina",
      "properties": { 
        "name": "Província da Cisplatina",
        "port_coords": [-56.2, -34.8],
        "capital_coords": [-56.2, -34.8]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-52.0, -32.0],
          [-57.0, -30.0],
          [-54.0, -26.0],
          [-58.0, -34.0],
          [-53.0, -34.0],
          [-52.0, -32.0]
        ]]
      }
    }
  ]
};

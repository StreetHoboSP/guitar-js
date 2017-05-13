Guitar JS is a JavaScript library, which draw an SVG image of guitar 
chord

# Install

```
    npm install guitar-js
```

# Usage

To add a chord

```javascript
    Guitar.chord('container', {
        // Options - see chapter Chord options
    });
```

# Chord options

Options is an object containing all the chord data.

### String status

String can be 'open' or 'closed'. When argument is null, status not 
displayed. The array must contain 6 values, equal 
to the number of strings.

```javascript
    {
        'statusString': ['closed', 'open', null, null, null, 'open']
    }    
```

### Chord

An array which contain data on clamped strings. 

* Clamp

```javascript
    {
        'chord': [{
            'fret': 2,
            'string': 3
        }]
    }    
```

* Barre

```javascript
    {
        'chord': [{
            'fret': 2,
            'barre': {
                'from': 1,
                'to': 6
            }
        }]
    }    
```

### Example

"Bm" chord code

```javascript
    Guitar.chord('container', {
        'statusString': ['open', 'open', 'open', 'open', 'open', 'closed'],
        'chord': [{
            'fret': 1,
            'barre': {
                'from': 1,
                'to': 5
            }
        }, {
            'fret': 2,
            'clamp': 2
        }, {
            'fret': 3,
            'clamp': 3
        }, {
            'fret': 3,
            'clamp': 4
        }]
    }); 
```
Tour
=========================

Basic Usage
------------

A `Tour` takes a list of tour objects. `Tour` will only support one enabled tour at a time. If multiple
tours are enabled, Tour will only render the first enabled in the `tours` list.

`Checkpoints` are rendered in the order they're listed in the checkpoint array.
The checkpoint objects themselves have additional props that can override the props defined in a `Tour`.

```$xslt
const [isTourEnabled, setIsTourEnabled] = useState(false);
const myFirstTour = {
  tourId: 'myFirstTour',
  advanceButtonText: 'Next',
  dismissButtonText: 'Dismiss',
  endButtonText: 'Okay',
  enabled: isTourEnabled,
  onDismiss: () => setIsTourEnabled(false),
  onEnd: () => setIsTourEnabled(false),
  checkpoints: [
    {
      body: 'Here's the first stop!',
      placement: 'top',
      target: '#checkpoint-1',
      title: 'First checkpoint',
    },
    {
      body: 'Here's the second stop!',
      onDismiss: () => console.log('Dismissed the second checkpoint'),
      placement: 'right',
      target: '#checkpoint-2',
      title: 'Second checkpoint',
    },
    {
      body: 'Here's the third stop!',
      placement: 'bottom',
      target: '#checkpoint-3',
      title: 'Third checkpoint',
    }
  ],
};

return (
  <>
    <Tour
      tours={[myFirstTour]}
    />
    <Container>
      <Button onClick={() => setIsTourEnabled(true)}>Start tour</Button>
      <div id="checkpoint-1">...</div>
      <Row>
        <div id="checkpoint-2">...</div>
        <div id="checkpoint-3">...</div>
      </Row>
    <Container>
  </>
);
```

Tour Props API
------------

tours `array`  
: comprised of objects with the following values:  

- **advanceButtonText** `string`:  
The text displayed on all buttons used to advance the tour.  
- **checkpoints** `array`:
An array comprised of checkpoint objects supporting the following values:  
  - **advanceButtonText** `string`:
  The text displayed on the button used to advance the tour for the given Checkpoint (overrides the `advanceButtonText` defined in the parent tour object).  
  - **body** `string`  
  - **dismissButtonText** `string`:
 The text displayed on the button used to dismiss the tour for the given Checkpoint (overrides the `dismissButtonText` defined in the parent tour object).  
  - **endButtonText** `string`:
  The text displayed on the button used to end the tour for the given Checkpoint (overrides the `endButtonText` defined in the parent tour object).  
  - **onAdvance** `func`:
  A function that would be triggered when triggering the `onClick` event of the advance button for the given Checkpoint.  
  - **onDismiss** `func`:
  A function that would be triggered when triggering the `onClick` event of the dismiss button for the given Checkpoint (overrides the `onDismiss` function defined in the parent tour object).  
  - **placement** `string`:
  A string that dictates the alignment of the Checkpoint around its target.  
  - **target** `string` *required*:
  The CSS selector for the Checkpoint's desired target.  
  - **title** `string`
- **dismissButtonText** `string`:
The text displayed on the button used to dismiss the tour.  
- **enabled** `bool` *required*:
Whether the tour is enabled. If there are multiple tours defined, only one should be enabled at a time.  
- **endButtonText** `string`:
The text displayed on the button used to end the tour.  
- **onDismiss** `func`:
A function that would be triggered when triggering the `onClick` event of the dismiss button.  
- **onEnd** `func`:
A function that would be triggered when triggering the `onClick` event of the end button.  
- **startingIndex** `number`:
The index of the desired `Checkpoint` to render when the tour starts.  
- **tourId** `string` *required*

import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { Button } from '@openedx/paragon';
import { useQuery } from '@tanstack/react-query'

const config = {
  pluginSlots: {
    unit_contents_slot: {
      keepDefault: true,
      plugins: [
        {
          // Display the unit ID *above* the content
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'before_unit_content',
            priority: 10, // 10 will come before the unit content, which has priority 50
            type: DIRECT_PLUGIN,
            RenderWidget: (props) => (
              <div style={{backgroundColor: 'cornflowerblue', color: 'white', padding: '8px 2px'}}>
                <small>This unit is <code style={{color: 'inherit'}}>{props.unitId}</code></small>
              </div>
            ),
          },
        },
        {
          // Display the course ID *after* the content
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'after_unit_content',
            priority: 80, // will come after the unit content, which has priority 50
            type: DIRECT_PLUGIN,
            RenderWidget: (props) => (
              <div style={{backgroundColor: 'lightcoral', color: 'white', padding: '8px 2px', margin: '8px 0'}}>
                <small>This course is <code style={{color: 'inherit'}}>{props.courseId}</code></small>
              </div>
            ),
          },
        },
        {
          // Blur the content
          op: PLUGIN_OPERATIONS.Wrap,
          widgetId: 'default_contents', // Wrap the contents
          wrapper: ({ component }) => {
            const [isBlurred, setBlur] = React.useState(true);
            const { authenticatedUser } = React.useContext(AppContext);
            if (isBlurred) {
              return (
                <div style={{position: 'relative'}}>
                  <div style={{filter: 'blur(5px)', pointerEvents: 'none'}}>
                    {component}
                  </div>
                  <div style={{
                    position: 'absolute', backgroundColor: 'white', left: '10%',
                    width: '80%', top: '200px', padding: '30px', border: '1px solid darkgrey',
                  }}>
                    <p>{authenticatedUser?.username || 'Learner'}, are you sure you want to learn this now?</p>
                    <Button onClick={() => setBlur(false)}>Yes</Button>
                  </div>
                </div>
              );
            } else {
              return <>{component}</>;
            }
          },
        },
        {
          // Display a random dog picture after the each unit
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'after_unit_dog',
            priority: 90,
            type: DIRECT_PLUGIN,
            RenderWidget: (props) => {
              const { data, isLoading, error } = useQuery({
                queryKey: ['unit_dog', props.unitId],
                queryFn: async () => {
                  const response = await fetch('https://dog.ceo/api/breeds/image/random');
                  return (await response.json()).message;
                },
                refetchOnWindowFocus: false,
                refetchOnMount: false,
              });
              if (isLoading) return <div>Loading doggo...</div>;
              if (!data) return <div>Error: {error}</div>;
              return <div><p>Bonus doggo for this unit:</p><img src={data} alt="Doggo" /><br /><br /></div>;
            },
          },
        },
      ]
    }
  },
}

export default config;

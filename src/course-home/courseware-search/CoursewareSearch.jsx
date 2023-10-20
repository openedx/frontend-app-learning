import React from 'react';
import { useDispatch } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@edx/paragon';
import {
  Close,
} from '@edx/paragon/icons';
import { setShowSearch } from '../data/slice';
import { useElementBoundingBox, useLockScroll } from './hooks';
import messages from './messages';

import CoursewareSearchBar from './CoursewareSearchBar';

const CoursewareSearch = ({ intl, ...sectionProps }) => {
  const dispatch = useDispatch();

  useLockScroll();

  const info = useElementBoundingBox('courseTabsNavigation');
  const top = info ? `${Math.floor(info.top)}px` : 0;

  return (
    <section className="courseware-search" style={{ '--modal-top-position': top }} data-testid="courseware-search-section" {...sectionProps}>
      <div className="courseware-search__close">
        <Button
          variant="tertiary"
          className="p-1"
          aria-label={intl.formatMessage(messages.searchCloseAction)}
          onClick={() => dispatch(setShowSearch(false))}
          data-testid="courseware-search-close-button"
        ><Icon src={Close} />
        </Button>
      </div>
      <div className="courseware-search__outer-content">
        <div className="courseware-search__content" style={{ height: '999px' }}>
          <h2>{intl.formatMessage(messages.searchModuleTitle)}</h2>
          <CoursewareSearchBar 
              onChange={() => {}}
              onSubmit={() => {}}
              placeholder={intl.formatMessage(messages.searchBarPlaceholderText)} /> 
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis semper rutrum odio quis congue.
            Duis sodales nibh et sapien elementum fermentum. Quisque magna urna, gravida at gravida et,
            ultricies vel massa.Aliquam in vehicula dolor, id scelerisque felis.
            Morbi posuere scelerisque tincidunt. Proin et gravida tortor. Vestibulum vel orci vulputate,
            gravida justo eu, varius dolor. Etiam viverra diam sed est tincidunt, et aliquam est efficitur.
            Donec imperdiet eros quis est condimentum faucibus.
          </p>
          <p>
            In mattis, tellus ut lacinia viverra, ligula ex sagittis ex, sed mollis ex enim ut velit.
            Nunc elementum, risus eget feugiat scelerisque, sapien felis laoreet nisl, ut pharetra neque
            lorem a elit. Maecenas elementum, metus fringilla suscipit imperdiet, mi nunc efficitur elit,
            sed consequat massa magna sit amet dui. Curabitur ultrices nisi vel lorem scelerisque, pharetra
            luctus nunc pulvinar. Morbi aliquam ante eget arcu condimentum consectetur. Fusce faucibus lacus
            sed pretium ultrices. Curabitur neque lacus, elementum convallis augue placerat, gravida
            scelerisque ipsum. Donec bibendum lectus id ullamcorper sodales. Integer quis ante facilisis erat
            maximus viverra. Nunc rutrum posuere lectus, aliquam congue odio blandit nec. Phasellus placerat,
            magna non bibendum lacinia, tortor orci vulputate dui, vitae imperdiet turpis dui nec tortor.
            Praesent porttitor mollis diam ut gravida. Praesent vitae felis dignissim sem accumsan dignissim.
            Fusce ullamcorper bibendum ante ac pellentesque. Aliquam sed leo vel leo pellentesque cursus a at risus.
            Donec sollicitudin maximus diam, sit amet molestie sapien commodo at.
          </p>
          <p>
            Cras ornare pulvinar est id rhoncus. Aenean ut risus magna. Fusce cursus pulvinar dui ut egestas.
            Quisque condimentum risus non mi sagittis, eu facilisis enim hendrerit. Integer faucibus dapibus rutrum.
            Nullam vitae mollis tortor, eu lacinia mi. Nunc commodo ex id eros hendrerit, vel interdum augue tristique.
            Suspendisse ullamcorper, purus in vestibulum auctor, justo nisi finibus dolor,
            nec dignissim arcu enim a augue.
          </p>
          <p>
            Fusce vel libero odio. Orci varius natoque penatibus et magnis dis parturient montes,
            nascetur ridiculus mus. Pellentesque at varius turpis. Ut pulvinar efficitur congue. Vivamus cursus,
            purus at aliquet malesuada, felis quam blandit dolor, a interdum justo est semper augue.
            In eu lectus sit amet est pellentesque porta vel eget magna. Morbi sollicitudin turpis vitae faucibus
            pulvinar. Etiam placerat pulvinar porta.
          </p>
          <p>
            Suspendisse mattis eget felis non sagittis. Nulla facilisi. In bibendum cursus purus, non venenatis tellus
            dignissim sit amet. Phasellus volutpat ipsum turpis, non imperdiet nisi elementum a. Nunc mollis, sapien
            cursus vehicula consectetur, nunc turpis pulvinar mauris, at varius justo mi egestas nisi. Fusce semper
            sapien in orci rhoncus ornare. Donec maximus mi eu pulvinar convallis.
          </p>
          <p>
            Nullam tortor sem, hendrerit eu sapien ac, venenatis rhoncus ligula. Donec nibh leo, venenatis sed interdum
            ac, pharetra sed nibh. Orci varius natoque penatibus et magnis dis parturient montes,
            nascetur ridiculus mus. Sed congue risus eu mattis condimentum. In id nulla sit amet magna suscipit
            consectetur. Nullam vitae augue felis. In consequat tempus diam, a eleifend ante bibendum ac.
            Vivamus mi orci, fermentum ac viverra quis, tristique a ipsum. Morbi imperdiet porta sem, in sollicitudin
            risus dignissim at. Nulla dapibus iaculis vestibulum.
          </p>
        </div>
      </div>
    </section>
  );
};

CoursewareSearch.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CoursewareSearch);

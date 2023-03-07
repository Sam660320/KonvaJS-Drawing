import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Vector2d } from 'konva/lib/types';
import '../Styles/popup.css';
import Bioretention from '../assets/img/technicalDrawings/content.png';

const PopUpWindow = () => {
  function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
      function updateSize() {
        setSize([window.innerWidth, window.innerHeight]);
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
  }

  const width = 800;
  const height = 600;

  return (
    <div
      className={'popup centered'}
      style={{
        left: (useWindowSize()[0] - width) / 2,
        top: (useWindowSize()[1] - height) / 2,
        width,
        height,
      }}
    >
      <div className='nodeinfo'>
        <form action=''>
          <table>
            <tbody>
              {/* <tr>
                <td>
                  <input
                    type='text'
                    name='node-name'
                    id='node-name'
                    placeholder='Node Name'
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <input
                    type='number'
                    name='area'
                    id='area'
                    placeholder='Area'
                  />
                </td>
              </tr> */}
              <tr>
                <td>
                  {' '}
                  <img src={Bioretention} alt='' />
                </td>
              </tr>
              <tr>
                <td>
                  <input type='button' value='submit' />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </div>
  );
};

export default PopUpWindow;

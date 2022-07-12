import PropTypes from 'prop-types';
import { ValidatorNode } from '../../types/validator-node';

export const Stats = ({ nodes, handleError, onDone }) => {

  const styles = {
    spacer: {
      display: 'inline-block',
      width: 24,
      height: 4,
    },
  };
  const onBackClick = e => {
    e.preventDefault();
    onDone();
  };

  return (
    <div className={'card flex-grow-1'}>
      <div className={'card-header'}>
        <h3><span style={styles.spacer} /> Validator Stats:</h3>
      </div>
      <div className={'card-body'}></div>
    </div>
  );
};
Stats.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.instanceOf(ValidatorNode)),
  handleError: PropTypes.func,
  onDone: PropTypes.func,
};

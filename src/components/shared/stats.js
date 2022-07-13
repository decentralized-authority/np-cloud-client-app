import PropTypes from 'prop-types';
import { ValidatorNode } from '../../types/validator-node';
import { PricingController } from '../../modules/pricing-controller';
import { useEffect, useState } from 'react';
import * as math from 'mathjs';

const { bignumber } = math;

export const Stats = ({ nodes, pricing, handleError }) => {

  const [ totalStaked, setTotalStaked ] = useState('0');
  const [ totalUSDStaked, setTotalUSDStaked ] = useState('0');

  useEffect(() => {
    let sum = bignumber(0);
    for(const n of nodes) {
      if(!n.staked)
        continue;
      try {
        sum = math.add(sum, bignumber(n.stakedAmount));
      } catch(err) {
        // do nothing
      }
    }
    setTotalStaked(sum.toString());
    if(pricing) {
      try {
        const stakedInUSD = pricing.convert(sum, PricingController.currencies.USD);
        setTotalUSDStaked(Number(stakedInUSD).toFixed(2));
      } catch(err) {
        // do nothing
      }
    }
  }, [nodes, pricing]);

  const styles = {
    spacer: {
      display: 'inline-block',
      width: 24,
      height: 4,
    },
  };

  let staked = 0;
  let notStaked = 0;
  let scheduledForUnstake = 0;
  for(const n of nodes) {
    if(n.unstakeDate) {
      scheduledForUnstake++;
    } else if(n.staked) {
      staked++;
    } else {
      notStaked++;
    }
  }

  return (
    <div className={'card flex-grow-1'}>
      <div className={'card-header'}>
        <h3><span style={styles.spacer} /> Validator Stats:</h3>
      </div>
      <div className={'card-body'}>

        <h3>Total Staked POKT:</h3>
        <h2 className={'text-success text-monospace'}>{totalStaked} POKT <small style={{fontSize: '80%'}}>{totalUSDStaked ? `$${totalUSDStaked} USD` : ''}</small></h2>

        <h3 className={'mt-3'}>Staked Validators:</h3>
        <h2><span className={'text-success'}>{staked}</span></h2>

        <h3 className={'mt-3'}>Validators Scheduled to Unstake:</h3>
        <h2 className={'text-warning'}>{scheduledForUnstake}</h2>

        <h3 className={'mt-3'}>Validators Not Staked:</h3>
        <h2 className={'text-danger'}>{notStaked}</h2>

      </div>
    </div>
  );
};
Stats.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.instanceOf(ValidatorNode)),
  pricing: PropTypes.instanceOf(PricingController),
  handleError: PropTypes.func,
  onDone: PropTypes.func,
};

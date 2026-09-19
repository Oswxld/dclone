import * as Blockly from 'blockly';
import * as En from 'blockly/msg/en';

Blockly.setLocale(En);

export const DERIV_ROOT_FILL = '#064e72';
export const DERIV_ROOT_STROKE = '#053b56';
export const DERIV_STEP_FILL = '#e5e5e5';
export const DERIV_STEP_STROKE = '#acacac';

export const DERIV_NAVY = DERIV_ROOT_FILL;
export const DERIV_GRAY = DERIV_STEP_FILL;
export const DERIV_GRAY_BORDER = DERIV_STEP_STROKE;

// Spacer image used to stretch blocks horizontally
const SHELF_SPACER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// 1. Trade Parameters Icon (Alt: "T")
const TRADE_PARAMS_ICON_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAAGXcA1uAAAAAXNSR0IArs4c6QAAAK9JREFUSA3tVUkOgCAMROP/f4PfU4iOaWQKLYmBg71AOksXTAyhGkeKKuECjTSDUwcFxVdNawNgQ10omJNKROqiJbMJsKJZgKgEouuESRYVFVxO35JTnxGDvk9aWQ5GCXfSPbRbsLHysr0lBeMESaKE3hkmbKk230SY9Ulky5rG/SVJU8udPrMU5s7w9bEugUlN886MWiJN86/o2dywFQ17g10b+dlJefH9X0t9X+YETM6gfmoeI+MAAAAASUVORK5CYII=';

// 2. Purchase Conditions Icon (Alt: "P")
const PURCHASE_CONDITIONS_ICON_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAAEgBckRAAAAAXNSR0IArs4c6QAAAvlJREFUaAXtmU1u00AUxxPEGoluKMcgJ8gCARsW9CZ0ReEU5BwFiYpWqtgYiQuQFSygJ2CRLV2E39+ZZ42dGc84XxIwT3p9X//34VfbsZPRaGNaQkpGPNu4yGESGfHUOtnYte0b6G8NdABJu7NoG4KXmi1GwUTACwtYomzp5r9ripP3/KB8zj7q4P4t0z9o9PfJowM0NhD6D9NN+sFm1xb05Rjybe171nKkDBLqfw6yt1Oqjjo3F4XArbli1dfmT7YpgOQGWPanLgjfFXyn6x9sU+QMfhdKxL/1OfSAGreh4vIR643H8pQ4hydRQCAAPv9owJ7AF1YH/bKr+z7FsPMbdBP8ZNNNOuwE+6v0bPILpJLAXsAvUrgSLxsoG4hsgAtoDDe3CoPhW7uFW8yXOffzcxK++ElOfxzwDXcxafAmhvscfjO8opdBgSfwjedqVPxaXbB5A0op5P+GH8ZwqXgwj6RtaO1kiDYJBiJOJop+HuScRZGyLfcUq2p5nJHVgAnrQzepXF/HnMIVnEckt84Os02qSkdfYN/Pq75KnpPQPFVYMZOBBq2B/EaxFVWApga0x2WT8vu64UIyq0EoMdfXeuC3JFZxhP7L7ByZe0Q5tQqmbKBsoGygbOCv2wAfHU/1SQp9Sw0P5nuNJCeFPUicYY7hW8fHqaYOr4dR5UQfSFN1dhJnAD1a/4RF2RsFq8d10Q0ce+LYyYy9RWiulw/R615gIEiOvuASpb/IDeRv7aLxq7r9FgOQbwvY7g2s72ho0vurgjuIfYmPfbMNijGhvsoSnQxKHABW7brDcvkhN23IBVS5otPc4hvgrHa1QW5/CpvR26loHkKuQuuvc/L7+BDO4sT0tiZ6ZL6dSgrr/VGkd54WrdzpYUM4FVJNF1u0CieM7g90CfjoM4Dn8BTu3v6u8LW2jZ3rA1rXlKz0Zy/Ehk7dlma7bkDdmav9cte1m3o0mLgmweugAW6gUHfuau/n/LeZaHLtGu1DXFufIssGygb+kw38ARimnBqQbBHiAAAAAElFTkSuQmCC';

// 3. Sell Conditions Icon (Alt: "S")
const SELL_CONDITIONS_ICON_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAAEgBckRAAAAAXNSR0IArs4c6QAAA45JREFUaAXtWDFrFUEQzoU0QhpjFVRs/Cc2Sf6AxD4BQSF/QBFtbPwDYici2ImFIqaVlBEEK7FICBaxCFEQRM/v29vZzO7O3dv3uGCEXdg3M998M7O7d7e37+bmZmpt2y4xEPLITABHazpOC0wLwt5wtVKHDGBeFJEg7og+okTaVY5hUgslSQwGFJhb2tZ6mARI3XQ77x/YbzQR9mlMTpc4u3rDoWEFomXtGe5+0zSXg28oCL69IT8r/kwJYocLF0p1yi2ITwl2YiL6+MTq5iQZiUNvtO24GaAywLc+5FfUqp7tFdCXUeulo0bMMfoy+WY8QdUcMU0O/xfPuZ/6fOJtyZH56chABcC94oMXFWyqOlffs2YFXge4hi3gu05gEU3Mj24ZklvDtkUCfgHdfMiBu+cXMnos3QbGZHDsQVyyEs+CYaYh9yzxNaauQF2BWVaATzL6WG01GwMzE4TgfhSdGzKyAUi8z5HvzEKA5Ez08TOkA34jGInCeDT5H2EX6Di9O+k17+d2nW1kwDjz0JL6Pa85xfKRS5BP0T8oV6aSWwYqFoPQHiqoVyUxc5pgwgLnM3loFxNXZJIQATRMULHgf+5596AfKlemmrkIou2gZxfQJ6b/Lfov9CdZVgDAN9B5fLFnANy9TyH7ijyD72pPch5ZeIu7uynjwOGqQrDI1H+zJJ6Jtb6gK2mH1jVnSFcx+0O86qsrUFegrkBdgboC/9MKZK91vPBG/ac88mLEnxmt5Hxjs2kfTDnHTH3M0HlKdNTioYxtXfM7KB6X9gddiJA8OHHgPESx8UCVXbEQaCjg30bnMf+c4TYh1kCX702szTFwLK6ZQRoUIiSPllwNHjOLBw7uFfQf6GxH6LtO635u6lpDOuicCGtzDO6YCxndGWY8SWymswBE6F2XoG0PIN3EIVfQ36G/KkhhUhDrmunUYDFRByU6cvBsL+0Qyh30iV8QkzSRKcki0DKKiVZwgiHXPDrv4W8+74uEUmz6+Ml3RjGxpzTiP/ocL4UC+5HHvgo2rfTx5ROQAC+5K5hfsNOBgLeAzgH/RtftNYzzKd+yweOuIzuRzlE+AUmMaH6QkK3U/Owi3FQi7gH6+xQfssHnzsPGmu5zDfkOwc9QrPNZRGCyD0/9YWpiwYSAWrJlRlfcGhdDo//dPtca5GMGeFuLxR5cc8bSuQ3rXPwvv6mBqtcVqCtQV+Dfr8BfZ6VurZP8obgAAAAASUVORK5CYII=';

// 4. Restart Trading Conditions Icon (Alt: "F")
const RESTART_CONDITIONS_ICON_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAAEgBckRAAAAAXNSR0IArs4c6QAAAa5JREFUaAXtV1tywzAIdDq5Rg/Ui/SGzYl8j1brzqYYidHDYWw60g/iIWABKc6yGOsG+XdaSr/uFLe0dkZkNC25Wt6U7zq7C05zJMH9FofBd0IymZIKR4qYWAyh95LfbCgAxYLwd/e3h+yJm0YQWiurk2V4cXkzaALO5owKAJV7E7gsr9zzQBaBiirVXaV3KYeTbtDVyNOgUIFU9q+CeFj0bBs9sL/k5fhJnSXHOakbnzxmUKH3kl5m0JK1ZQ/fxQBHncqk3Uskg217mX2mHBC4I3APMAB6HglfgXQPXvqaZgXBRTu4PqTT+M+1+00uPtfW+94rRy/cEbgHKJYIY8pRGykLz/7jEkmIslwt8mSzSrtsbznMDBsF7lM0A1Q74V6iagbTYFZgVsC7Ani7sbzjjPrPPhu1o4skv6YPj3edG/jDAOQXjQxgAe+1p0/rXPhfgvAAih+9bJukVgtfNSq9/plb+A6EB9A8QmePCkdG0/AdCA+geYR068hbo0W9pr326Tz+p35qP+SbAVjPHB2dRcOP0ARw1ugwbvgOtFziR0J72T807MSkswKDFfgBlTxsE+QpCHoAAAAASUVORK5CYII=';

// ============================================================================
// BLOCK DEFINITIONS & CONFIGURATION FOR ZELOS RENDERER
// ============================================================================
export const initDerivBlocks = () => {
  delete (Blockly.Blocks as any)['deriv_number_pill'];
  Blockly.Blocks['deriv_number_pill'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput().appendField(new Blockly.FieldNumber(1, 0), 'NUM');
      this.setOutput(true, 'Number');
      // Tell Zelos renderer to round this output block natively
      this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND); 
      this.setColour('#ffffff');
    },
  };

  delete (Blockly.Blocks as any)['trade_parameters_root'];
  Blockly.Blocks['trade_parameters_root'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage(TRADE_PARAMS_ICON_BASE64, 25, 25, 'T'))
        .appendField('1. Trade parameters');
      this.appendStatementInput('INITIAL_PARAMETERS');
      this.appendDummyInput().appendField('Run once at start:');
      this.appendStatementInput('INITIALIZATION');
      this.appendDummyInput().appendField('Trade options:');
      this.appendStatementInput('SUBMARKET_OPTIONS');
      this.appendDummyInput().appendField(new Blockly.FieldImage(SHELF_SPACER, 380, 10, ''));
      this.setColour(DERIV_ROOT_FILL);
    },
  };

  delete (Blockly.Blocks as any)['deriv_market_clean'];
  Blockly.Blocks['deriv_market_clean'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Market:')
        .appendField(
          new Blockly.FieldDropdown(() => [
            ['Derived', 'Derived'],
            ['Forex', 'Forex'],
          ]),
          'MARKET'
        )
        .appendField('>')
        .appendField(
          new Blockly.FieldDropdown(() => [
            ['Continuous Indices', 'Continuous Indices'],
            ['Daily Reset Indices', 'Daily Reset Indices'],
          ]),
          'SUBMARKET'
        )
        .appendField('>')
        .appendField(
          new Blockly.FieldDropdown(() => [
            ['Volatility 100 (1s) Index', '1HZ100V'],
            ['Volatility 10 (1s) Index', '1HZ10V'],
            ['Volatility 15 (1s) Index', '1HZ15V'],
            ['Volatility 25 (1s) Index', '1HZ25V'],
            ['Volatility 30 (1s) Index', '1HZ30V'],
            ['Volatility 50 (1s) Index', '1HZ50V'],
            ['Volatility 75 (1s) Index', '1HZ75V'],
            ['Volatility 90 (1s) Index', '1HZ90V'],
            ['Volatility 10 Index', 'R_10'],
            ['Volatility 25 Index', 'R_25'],
            ['Volatility 50 Index', 'R_50'],
            ['Volatility 75 Index', 'R_75'],
            ['Volatility 100 Index', 'R_100'],
          ]),
          'ASSET'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(DERIV_STEP_FILL);
    },
  };

  delete (Blockly.Blocks as any)['trade_step_type'];
  Blockly.Blocks['trade_step_type'] = {
    init: function (this: Blockly.Block) {
      const categoryDropdown = new Blockly.FieldDropdown(
        () => [
          ['Up/Down', 'Up/Down'],
          ['Touch/No Touch', 'Touch/No Touch'],
          ['In/Out', 'In/Out'],
          ['Asians', 'Asians'],
          ['Digits', 'Digits'],
          ['Reset Call/Reset Put', 'Reset Call/Reset Put'],
          ['High/Low Ticks', 'High/Low Ticks'],
          ['Only Ups/Only Downs', 'Only Ups/Only Downs'],
          ['Multipliers', 'Multipliers'],
          ['Accumulators', 'Accumulators'],
        ],
        (newCategory: string) => {
          const subDropdown = this.getField('TRADE_TYPE') as Blockly.FieldDropdown;
          if (subDropdown) {
            const options = TRADE_TYPE_MAP[newCategory] || [['Default', 'DEFAULT']];
            subDropdown.setValue(options[0][1]);
          }

          const ws = this.workspace;
          
          // Update Prediction field visibility
          const optionsBlock = ws.getAllBlocks(false).find((b) => b.type === 'trade_options_block');
          if (optionsBlock) {
            (optionsBlock as any).updatePredictionField?.(newCategory === 'Digits');
          }
          
          // Force Contract Type block to refresh its options
          const contractBlock = ws.getAllBlocks(false).find((b) => b.type === 'trade_step_contract');
          if (contractBlock) {
             (contractBlock as any).updateContractOptions?.(subDropdown ? subDropdown.getValue() : 'RISEFALL');
          }
        }
      );

      const subTypeDropdown = new Blockly.FieldDropdown(
        () => {
          const cat = this.getFieldValue('TRADE_CATEGORY') || 'Up/Down';
          return TRADE_TYPE_MAP[cat] || [['Rise/Fall', 'RISEFALL']];
        },
        (newTradeType: string) => {
          const ws = this.workspace;
          // Force Contract Type block to refresh its options when Trade Type changes
          const contractBlock = ws.getAllBlocks(false).find((b) => b.type === 'trade_step_contract');
          if (contractBlock) {
             (contractBlock as any).updateContractOptions?.(newTradeType);
          }
        }
      );

      this.appendDummyInput()
        .appendField('Trade Type:')
        .appendField(categoryDropdown, 'TRADE_CATEGORY')
        .appendField('>')
        .appendField(subTypeDropdown, 'TRADE_TYPE');

      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(DERIV_STEP_FILL);
    },
  };

  delete (Blockly.Blocks as any)['trade_step_contract'];
  Blockly.Blocks['trade_step_contract'] = {
    init: function (this: any) {
      
      this.updateContractOptions = (tradeType: string) => {
        const contractField = this.getField('CONTRACT_TYPE') as Blockly.FieldDropdown;
        if (!contractField) return;
        
        let newOptions: [string, string][] = [['Both', 'Both']];
        
        if (tradeType === 'MATCHDIFF') {
            newOptions = [['Both', 'Both'], ['Matches', 'DIGITMATCH'], ['Differs', 'DIGITDIFF']];
        } else if (tradeType === 'EVENODD') {
            newOptions = [['Both', 'Both'], ['Even', 'DIGITEVEN'], ['Odd', 'DIGITODD']];
        } else if (tradeType === 'OVERUNDER') {
            newOptions = [['Both', 'Both'], ['Over', 'DIGITOVER'], ['Under', 'DIGITUNDER']];
        } else if (tradeType === 'RISEFALL') {
            newOptions = [['Both', 'Both'], ['Rise', 'CALL'], ['Fall', 'PUT']];
        }

        contractField.menuGenerator_ = newOptions;
        contractField.setValue(newOptions[0][1]);
        
        if (this.rendered) {
            this.render();
        }
      };

      this.appendDummyInput()
        .appendField('Contract Type:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Both', 'Both'],
            ['Rise', 'CALL'],
            ['Fall', 'PUT']
          ]),
          'CONTRACT_TYPE'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(DERIV_STEP_FILL);
    },
  };

  delete (Blockly.Blocks as any)['trade_step_candle'];
  Blockly.Blocks['trade_step_candle'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Default Candle Interval:')
        .appendField(new Blockly.FieldDropdown(() => CANDLE_INTERVALS), 'CANDLE_INTERVAL');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(DERIV_STEP_FILL);
    },
  };

  delete (Blockly.Blocks as any)['trade_step_restart_error'];
  Blockly.Blocks['trade_step_restart_error'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Restart buy/sell on error (disable for better performance):')
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'RESTART_ERROR');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(DERIV_STEP_FILL);
    },
  };

  delete (Blockly.Blocks as any)['trade_step_restart_last'];
  Blockly.Blocks['trade_step_restart_last'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Restart last trade on error (bot ignores the unsuccessful trade):')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'RESTART_LAST_TRADE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(false);
      this.setColour(DERIV_STEP_FILL);
    },
  };

  delete (Blockly.Blocks as any)['trade_options_block'];
  Blockly.Blocks['trade_options_block'] = {
    init: function (this: any) {
      this.appendDummyInput('OPTIONS_ROW')
        .appendField('Duration:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Ticks', 't'],
            ['Seconds', 's'],
          ]),
          'DURATION_UNIT'
        )
        .appendField(new Blockly.FieldNumber(1, 1), 'DURATION')
        .appendField('Stake: USD')
        .appendField(new Blockly.FieldNumber(1, 0.35, undefined, 2), 'STAKE');

      this.updatePredictionField = (show: boolean) => {
        const row = this.getInput('OPTIONS_ROW');
        const hasPred = this.getField('PREDICTION');
        if (show && !hasPred) {
          row.appendField('Prediction:', 'PREDICTION_LABEL');
          row.appendField(new Blockly.FieldNumber(1, 0, 9, 0), 'PREDICTION');
        } else if (!show && hasPred) {
          row.removeField('PREDICTION_LABEL');
          row.removeField('PREDICTION');
        }
        this.render();
      };

      this.setPreviousStatement(true, null);
      this.setNextStatement(false);
      this.setColour(DERIV_STEP_FILL);
    },
  };

  delete (Blockly.Blocks as any)['purchase_conditions_root'];
  Blockly.Blocks['purchase_conditions_root'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage(PURCHASE_CONDITIONS_ICON_BASE64, 25, 25, 'P'))
        .appendField('2. Purchase conditions');
      this.appendStatementInput('PURCHASE_ACTION');
      this.appendDummyInput().appendField(new Blockly.FieldImage(SHELF_SPACER, 380, 10, ''));
      this.setColour(DERIV_ROOT_FILL);
    },
  };

  delete (Blockly.Blocks as any)['purchase_action_block'];
  Blockly.Blocks['purchase_action_block'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('Purchase')
        .appendField(
          new Blockly.FieldDropdown([
            ['Rise', 'CALL'],
            ['Fall', 'PUT'],
            ['Matches', 'DIGITMATCH'],
            ['Differs', 'DIGITDIFF'],
            ['Even', 'DIGITEVEN'],
            ['Odd', 'DIGITODD'],
            ['Over', 'DIGITOVER'],
            ['Under', 'DIGITUNDER'],
          ]),
          'PURCHASE_TYPE'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(false);
      this.setColour(DERIV_STEP_FILL);
    },
  };

  delete (Blockly.Blocks as any)['sell_conditions_root'];
  Blockly.Blocks['sell_conditions_root'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage(SELL_CONDITIONS_ICON_BASE64, 25, 25, 'S'))
        .appendField('3. Sell conditions');
      this.appendStatementInput('SELL_ACTION');
      this.appendDummyInput().appendField(new Blockly.FieldImage(SHELF_SPACER, 380, 10, ''));
      this.setColour(DERIV_ROOT_FILL);
    },
  };

  delete (Blockly.Blocks as any)['sell_statement_block'];
  Blockly.Blocks['sell_statement_block'] = {
    init: function (this: Blockly.Block) {
      // 1. Remove strict Boolean check so Zelos natively draws a round socket instead of Hexagonal
      this.appendValueInput('IF0').appendField('if');
      
      // 2. Add spacer to elongate the top row 
      this.appendDummyInput()
        .appendField('then')
        .appendField(new Blockly.FieldImage(SHELF_SPACER, 180, 10, ''));
        
      this.appendStatementInput('DO0');
      
      // 3. Add spacer to elongate the bottom row matching the top length
      this.appendDummyInput('BOTTOM_ROW')
        .appendField(
          new Blockly.FieldImage(
            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="%231f2937"/><path d="M8 4.5v7M4.5 8h7" stroke="%23ffffff" stroke-width="1.8" stroke-linecap="round"/></svg>',
            16,
            16,
            '+'
          )
        )
        .appendField(new Blockly.FieldImage(SHELF_SPACER, 290, 10, ''));

      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(false);
      this.setColour(DERIV_STEP_FILL);
    },
  };

  delete (Blockly.Blocks as any)['sell_available_check'];
  Blockly.Blocks['sell_available_check'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput().appendField('Sell is available');
      // 1. Omit strict 'Boolean' so Zelos allows it to be perfectly round
      this.setOutput(true, null); 
      // 2. Tell Zelos renderer to make it a capsule pill
      this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND); 
      // 3. Set background to gray to match the parent block perfectly
      this.setColour(DERIV_STEP_FILL); 
    },
  };

  delete (Blockly.Blocks as any)['restart_conditions_root'];
  Blockly.Blocks['restart_conditions_root'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage(RESTART_CONDITIONS_ICON_BASE64, 25, 25, 'F'))
        .appendField('4. Restart trading conditions');
      this.appendStatementInput('RESTART_ACTION');
      this.appendDummyInput().appendField(new Blockly.FieldImage(SHELF_SPACER, 380, 10, ''));
      this.setColour(DERIV_ROOT_FILL);
    },
  };

  delete (Blockly.Blocks as any)['trade_again_block'];
  Blockly.Blocks['trade_again_block'] = {
    init: function (this: Blockly.Block) {
      this.appendDummyInput().appendField('Trade again');
      this.setPreviousStatement(true, null);
      this.setNextStatement(false);
      this.setColour(DERIV_STEP_FILL);
    },
  };

  // --- Add Global CSS for Blockly Overrides ---
  if (typeof document !== 'undefined') {
    let styleTag = document.getElementById('deriv-blockly-theme-css');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'deriv-blockly-theme-css';
      // CSS to force Blockly dropdowns to have a clean LIGHT theme to match Deriv's style
      // Also strictly removes scrollbars and adjusts font size so ticks are visible
      styleTag.innerHTML = `
        /* Hide scrollbars */
        .blocklyDropDownDiv, 
        .blocklyWidgetDiv .blocklyMenu {
          background-color: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
          padding: 4px 0 !important;
          scrollbar-width: none !important; /* Firefox */
        }
        .blocklyDropDownDiv::-webkit-scrollbar,
        .blocklyWidgetDiv .blocklyMenu::-webkit-scrollbar {
          display: none !important; /* Chrome/Safari/Edge */
        }
        
        /* Adjust font size and padding to fit the tick */
        .blocklyDropDownDiv .blocklyMenuItem, 
        .blocklyWidgetDiv .blocklyMenuItem {
          color: #333333 !important;
          font-family: "IBM Plex Sans", sans-serif !important;
          font-size: 12px !important;
          padding: 8px 12px 8px 26px !important; 
          transition: background-color 0.2s ease !important;
          position: relative !important;
        }
        .blocklyDropDownDiv .blocklyMenuItemHover, 
        .blocklyWidgetDiv .blocklyMenuItemHover {
          background-color: #f3f4f6 !important; /* light grey hover */
        }
        .blocklyDropDownDiv .blocklyMenuItemSelected, 
        .blocklyWidgetDiv .blocklyMenuItemSelected {
          background-color: #e5e7eb !important;
          font-weight: 700 !important;
        }
        .blocklyDropDownDiv .blocklyMenuItemContent, 
        .blocklyWidgetDiv .blocklyMenuItemContent {
          color: #333333 !important;
        }
        /* Ensure the checkmark (tick) displays correctly without cutoff */
        .blocklyDropDownDiv .blocklyMenuItemCheckbox {
          position: absolute !important;
          left: 8px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
        }
      `;
      document.head.appendChild(styleTag);
    }
  }
};

// ============================================================================
// THEME DEFINITION
// ============================================================================
export const DerivTheme = Blockly.Theme.defineTheme('deriv_theme', {
  name: 'deriv_theme',
  base: Blockly.Themes.Classic,
  blockStyles: {
    root_navy: {
      colourPrimary: DERIV_ROOT_FILL,
      colourSecondary: DERIV_ROOT_STROKE,
      colourTertiary: DERIV_ROOT_STROKE,
    },
    parameter_gray: {
      colourPrimary: DERIV_STEP_FILL,
      colourSecondary: DERIV_STEP_STROKE,
      colourTertiary: DERIV_STEP_STROKE,
    },
  },
  categoryStyles: {},
  componentStyles: {
    workspaceBackgroundColour: '#f4f5f8',
    toolboxBackgroundColour: '#ffffff',
    flyoutBackgroundColour: '#ffffff',
    fieldBackgroundColour: 'transparent',
    fieldBorderColour: '#acacac',
    fieldTextColour: '#333333',
  },
  fontStyle: {
    family: '"IBM Plex Sans", sans-serif',
    weight: '400',
    size: 16.3,
  },
});

export const TRADE_TYPE_MAP: Record<string, [string, string][]> = {
  'Up/Down': [
    ['Rise/Fall', 'RISEFALL'],
    ['Rise Equals/Fall Equals', 'RISEEQUAL'],
    ['Higher/Lower', 'HIGHERLOWER'],
  ],
  'Digits': [
    ['Matches/Differs', 'MATCHDIFF'],
    ['Even/Odd', 'EVENODD'],
    ['Over/Under', 'OVERUNDER'],
  ],
  'Touch/No Touch': [['Touch/No Touch', 'TOUCH']],
  'In/Out': [['Ends Between/Outside', 'INOUT']],
  'Asians': [['Asian Up/Down', 'ASIANS']],
  'Reset Call/Reset Put': [['Reset Call/Put', 'RESET']],
  'High/Low Ticks': [['High/Low Ticks', 'TICKS']],
  'Only Ups/Only Downs': [['Only Ups/Downs', 'UPSDOWNS']],
  'Multipliers': [['Multipliers', 'MULT']],
  'Accumulators': [['Accumulators', 'ACCU']],
};

export const CANDLE_INTERVALS: [string, string][] = [
  ['1 minute', '60'],
  ['2 minutes', '120'],
  ['3 minutes', '180'],
  ['5 minutes', '300'],
  ['10 minutes', '600'],
  ['15 minutes', '900'],
  ['30 minutes', '1800'],
  ['1 hour', '3600'],
  ['2 hours', '7200'],
  ['4 hours', '14400'],
];
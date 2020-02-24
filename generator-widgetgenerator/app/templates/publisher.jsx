/*
 *  Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */

import React from 'react';
import Widget from '@wso2-dashboards/widget';
import Button from '@material-ui/core/Button';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Axios from 'axios';
import {
    defineMessages, IntlProvider, FormattedMessage, addLocaleData,
} from 'react-intl';

const darkTheme = createMuiTheme({
  palette: {
      type: 'dark',
  },
  typography: {
      useNextVariants: true,
  },
});

const lightTheme = createMuiTheme({
  palette: {
      type: 'light',
  },
  typography: {
      useNextVariants: true,
  },
});

/**
 * Language
 * @type {string}
 */
const language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;

/**
 * Language without region code
 */
const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];


class <%= className %> extends Widget {
  /**
   * Creates an instance of <%= className %>.
   * @param {any} props @inheritDoc
   * @memberof <%= className %>
   */
  constructor(props) {
   super(props);
   this.state = {
      width: this.props.width,
      height: this.props.height,
      localeMessages: null,
   };

   this.styles = {
    // Insert styles Here
   }

   // This will re-size the widget when the glContainer's width is changed.
   if (this.props.glContainer != undefined) {
     this.props.glContainer.on('resize', () =>
       this.setState({
         width: this.props.glContainer.width,
         height: this.props.glContainer.height,
       })
     );
   }

   this.publishMsg = this.publishMsg.bind(this);
   this.setQueryParamToURL = this.setQueryParamToURL.bind(this);
   this.renderPublishData = this.renderPublishData.bind(this);
 }

 componentWillMount() {
  const locale = (languageWithoutRegionCode || language || 'en');
  this.loadLocale(locale).catch(() => {
      this.loadLocale().catch(() => {
          // TODO: Show error message.
      });
  });
}

componentDidMount() {
  // Use this method to load default values to publisher parameters
}

/**
  * Load locale file
  * @param {string} locale Locale name
  * @memberof <%= className %>
  * @returns {string}
  */
  loadLocale(locale = 'en') {
    return new Promise((resolve, reject) => {
      Axios
          .get(`${window.contextPath}/public/extensions/widgets/<%= widgetId %>/locales/${locale}.json`)
          .then((response) => {
              // eslint-disable-next-line global-require, import/no-dynamic-require
              addLocaleData(require(`react-intl/locale-data/${locale}`));
              this.setState({ localeMessages: defineMessages(response.data) });
              resolve();
          })
          .catch(error => reject(error));
    });
  }

/**
* Publishing the parameters for the subscriber widgets
*/
publishMsg(message) {
  super.publish(message);
};

/**
* Create the parameters that need to be published to subscriber widgets
*/
renderPublishData() {
  this.publishMsg({
  //Enter the parameters that you want to publish here
  parameter1: "data1",
  parameter2: "data2"
  });
};

 /**
  * Registering global parameters in the dashboard
  */
 setQueryParamToURL() {
  super.setGlobalState('registerId', {
   // Enter the global parameters that you want to register in the dashboard
  });
};

  /**
   * @returns {ReactElement} Render the <%= className %>
   * @memberof <%= className %>
   */
 render() {
  const { localeMessages } = this.state;
  const { muiTheme } = this.props;
  const themeName = muiTheme.name;
  
   return (
    <IntlProvider
      locale={language}
      messages={localeMessages}
    >
      <MuiThemeProvider 
        theme={themeName === 'dark' ? darkTheme : lightTheme}>
            <FormattedMessage
                id='widget.heading'
                defaultMessage='SAMPLE HEADING'
            />
            // Insert code for rendering the UI
            <div>
              <Button 
                  variant="contained" 
                  color="primary"
                  onClick={this.renderPublishData}
              >
                Publish
              </Button>
              {this.setQueryParamToURL()}
            </div>
      </MuiThemeProvider>
    </IntlProvider>
   );
  }
}

global.dashboard.registerWidget('DateRangePicker', DateTimePicker);

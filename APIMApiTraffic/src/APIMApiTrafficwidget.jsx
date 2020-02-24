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
import cloneDeep from 'lodash/cloneDeep';
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

/**
 * Create React Component for APIMApiTraffic
 * @class APIMApiTrafficwidget
 * @extends {Widget}
 */
class APIMApiTrafficwidget extends Widget {
    /**
     * Creates an instance of APIMApiTrafficwidget.
     * @param {any} props @inheritDoc
     * @memberof APIMApiTrafficwidget
     */
    constructor(props) {
        super(props);
        this.state = {
            width: this.props.width,
            height: this.props.height,
            queryData: null,
            publisherData: null,
            localeMessages: null,
        };

        this.styles = {
            // Insert styles Here
        }

        // This will re-size the widget when the glContainer's width is changed.
        if (this.props.glContainer !== undefined) {
            this.props.glContainer.on('resize', () => this.setState({
                width: this.props.glContainer.width,
                height: this.props.glContainer.height,
            }));
        }
        
        this.handlePublisherParameters = this.handlePublisherParameters.bind(this);  
        this.assembleQuery = this.assembleQuery.bind(this);    
        this.handleQueryResults = this.handleQueryResults.bind(this);
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
        const { widgetID } = this.props;
        super.getWidgetConfiguration(widgetID)
            .then((message) => {
                this.setState({
                    providerConfig: message.data.configs.providerConfig,
                }, () => super.subscribe(this.handlePublisherParameters));
            })
            .catch((error) => {
                console.error("Error occurred when loading widget '" + widgetID + "'. " + error);
                this.setState({
                    faultyProviderConfig: true,
                });
            });
    }

    componentWillUnmount() {
        const { id } = this.props;
        super.getWidgetChannelManager().unsubscribeWidget(id);
    }

    /**
      * Load locale file
      * @param {string} locale Locale name
      * @memberof APIMApiTrafficwidget
      * @returns {string}
      */
    loadLocale(locale = 'en') {
        return new Promise((resolve, reject) => {
            Axios
                .get(`${window.contextPath}/public/extensions/widgets/APIMApiTraffic/locales/${locale}.json`)
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
     * Retrieve params from publisher
     * @memberof APIMApiTrafficwidget
     * */
    handlePublisherParameters(receivedMsg) {
        this.setState({
            publisherData: receivedMsg
            // Insert the code to handle publisher data
        }, this.assembleQuery)
    }

    /**
     * Formats the query using selected options
     * @memberof APIMApiTrafficwidget
     * */
    assembleQuery() {
        const { publisherData } = this.state;
        const { id, widgetID: widgetName } = this.props;

        const dataProviderConfigs = cloneDeep(providerConfig);
        dataProviderConfigs.configs.config.queryData.queryName = 'sampleQuery';
        dataProviderConfigs.configs.config.queryData.queryValues = {
            '{{sampleValues}}': publisherData,
        };
        super.getWidgetChannelManager()
            .subscribeWidget(id, widgetName, this.handleQueryResults, dataProviderConfigs);
    }

    /**
     * Formats data retrieved
     * @param {object} message - data retrieved
     * @memberof APIMApiTrafficwidget
     * */
    handleQueryResults(message){
        const { data } = message;
        // Insert the code to handle the data recived through query
    }

    /**
     * @inheritDoc
     * @returns {ReactElement} Render the APIMApiTrafficwidget
     * @memberof APIMApiTrafficwidget
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
                            defaultMessage='TOTAL TRAFFIC'
                        />
                        // Insert code for rendering the UI
                </MuiThemeProvider>
            </IntlProvider>
        );
    }
}

global.dashboard.registerWidget('APIMApiTraffic', APIMApiTrafficwidget);

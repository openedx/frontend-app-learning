import React, { Component } from 'react';
import { Collapsible } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  FormattedMessage, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalculator, faQuestionCircle, faTimesCircle, faEquals,
} from '@fortawesome/free-solid-svg-icons';
import messages from './messages';

class Calculator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      equation: '',
      result: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    const urlEncoded = new URLSearchParams();
    urlEncoded.append('equation', this.state.equation);

    const response = await getAuthenticatedHttpClient().get(
      `${getConfig().LMS_BASE_URL}/calculate?${urlEncoded.toString()}`,
    );
    this.setState(() => ({ result: response.data.result }));
  }

  changeEquation(value) {
    this.setState(() => ({ equation: value }));
  }

  render() {
    return (
      <Collapsible.Advanced className="calculator">
        <div className="text-right">
          <Collapsible.Trigger tag="a" className="trigger btn">
            <Collapsible.Visible whenOpen>
              <FontAwesomeIcon icon={faTimesCircle} aria-hidden="true" className="mr-2" />
            </Collapsible.Visible>
            <Collapsible.Visible whenClosed>
              <FontAwesomeIcon icon={faCalculator} aria-hidden="true" className="mr-2" />
            </Collapsible.Visible>
            {this.props.intl.formatMessage(messages['calculator.button.label'])}
          </Collapsible.Trigger>
        </div>
        <Collapsible.Body className="calculator-content pt-4">
          <form onSubmit={this.handleSubmit} className="container-xl form-inline flex-nowrap">
            <input
              type="text"
              placeholder={this.props.intl.formatMessage(messages['calculator.input.field.label'])}
              aria-label={this.props.intl.formatMessage(messages['calculator.input.field.label'])}
              className="form-control w-100"
              onChange={(event) => this.changeEquation(event.target.value)}
            />
            <button
              className="btn btn-primary mx-3"
              aria-label={this.props.intl.formatMessage(messages['calculator.submit.button.label'])}
              type="submit"
            >
              <FontAwesomeIcon icon={faEquals} aria-hidden="true" />
            </button>
            <input
              type="text"
              tabIndex="-1"
              readOnly
              aria-live="polite"
              placeholder={this.props.intl.formatMessage(messages['calculator.result.field.placeholder'])}
              aria-label={this.props.intl.formatMessage(messages['calculator.result.field.label'])}
              className="form-control w-50"
              value={this.state.result}
            />
          </form>

          <Collapsible.Advanced>
            <div className="container-xl">
              <Collapsible.Trigger className="btn btn-link btn-sm px-0 d-inline-flex align-items-center">
                <Collapsible.Visible whenOpen>
                  <FontAwesomeIcon icon={faTimesCircle} aria-hidden="true" className="mr-2" />
                </Collapsible.Visible>
                <Collapsible.Visible whenClosed>
                  <FontAwesomeIcon icon={faQuestionCircle} aria-hidden="true" className="mr-2" />
                </Collapsible.Visible>
                <FormattedMessage
                  id="calculator.instructions.button.label"
                  defaultMessage="Calculator Instructions"
                />
              </Collapsible.Trigger>
            </div>
            <Collapsible.Body className="container-xl pt-3" style={{ maxHeight: '50vh', overflow: 'auto' }}>
              <FormattedMessage
                tagName="h6"
                id="calculator.instructions"
                defaultMessage="For detailed information, see the {expressions_link}."
                values={{
                  expressions_link: (
                    <a href={getConfig().SUPPORT_URL_CALCULATOR_MATH}>
                      <FormattedMessage
                        id="calculator.instructions.support.title"
                        defaultMessage="Help Center"
                      />
                    </a>
                  ),
                }}
              />
              <p>
                <strong>
                  <FormattedMessage
                    id="calculator.instructions.useful.tips"
                    defaultMessage="Useful tips:"
                  />
                </strong>
              </p>
              <ul>
                <li className="hint-item" id="hint-paren">
                  <FormattedMessage
                    id="calculator.hint1"
                    defaultMessage="Use parentheses () to make expressions clear. You can use parentheses inside other parentheses."
                  />
                </li>
                <li className="hint-item" id="hint-spaces">
                  <FormattedMessage
                    id="calculator.hint2"
                    defaultMessage="Do not use spaces in expressions."
                  />
                </li>
                <li className="hint-item" id="hint-howto-constants">
                  <FormattedMessage
                    id="calculator.hint3"
                    defaultMessage="For constants, indicate multiplication explicitly (example: 5*c)."
                  />
                </li>
                <li className="hint-item" id="hint-howto-maffixes">
                  <FormattedMessage
                    id="calculator.hint4"
                    defaultMessage="For affixes, type the number and affix without a space (example: 5c)."
                  />
                </li>
                <li className="hint-item" id="hint-howto-functions">
                  <FormattedMessage
                    id="calculator.hint5"
                    defaultMessage="For functions, type the name of the function, then the expression in parentheses."
                  />
                </li>
              </ul>
              <table className="table small">
                <thead>
                  <tr>
                    <th scope="col">
                      <FormattedMessage
                        id="calculator.instruction.table.to.use.heading"
                        defaultMessage="To Use"
                      />
                    </th>
                    <th scope="col">
                      <FormattedMessage
                        id="calculator.instruction.table.type.heading"
                        defaultMessage="Type"
                      />
                    </th>
                    <th scope="col">
                      <FormattedMessage
                        id="calculator.instruction.table.examples.heading"
                        defaultMessage="Examples"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">
                      <FormattedMessage
                        id="calculator.instruction.table.to.use.numbers"
                        defaultMessage="Numbers"
                      />
                    </th>
                    <td>
                      <ul className="list-unstyled m-0">
                        <li>
                          <FormattedMessage
                            id="calculator.instruction.table.to.use.numbers.type1"
                            defaultMessage="Integers"
                          />
                        </li>
                        <li>
                          <FormattedMessage
                            id="calculator.instruction.table.to.use.numbers.type2"
                            defaultMessage="Fractions"
                          />
                        </li>
                        <li>
                          <FormattedMessage
                            id="calculator.instruction.table.to.use.numbers.type3"
                            defaultMessage="Decimals"
                          />
                        </li>
                      </ul>
                    </td>
                    <td dir="auto">
                      <ul className="list-unstyled m-0">
                        <li>2520</li>
                        <li>2/3</li>
                        <li>3.14, .98</li>
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <FormattedMessage
                        id="calculator.instruction.table.to.use.operators"
                        defaultMessage="Operators"
                      />
                    </th>
                    <td dir="auto">
                      <ul className="list-unstyled m-0">
                        <li>
                          {' + - * / '}
                          <FormattedMessage
                            id="calculator.instruction.table.to.use.operators.type1"
                            defaultMessage="(add, subtract, multiply, divide)"
                          />
                        </li>
                        <li>
                          {'^ '}
                          <FormattedMessage
                            id="calculator.instruction.table.to.use.operators.type2"
                            defaultMessage="(raise to a power)"
                          />
                        </li>
                        <li>
                          {'|| '}
                          <FormattedMessage
                            id="calculator.instruction.table.to.use.operators.type3"
                            defaultMessage="(parallel resistors)"
                          />
                        </li>
                      </ul>
                    </td>
                    <td dir="auto">
                      <ul className="list-unstyled m-0">
                        <li>x+(2*y)/x-1</li>
                        <li>x^(n+1)</li>
                        <li>v_IN+v_OUT</li>
                        <li>1||2</li>
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <FormattedMessage
                        id="calculator.instruction.table.to.use.constants"
                        defaultMessage="Constants"
                      />
                    </th>
                    <td dir="auto">c, e, g, i, j, k, pi, q, T</td>
                    <td dir="auto">
                      <ul className="list-unstyled m-0">
                        <li>20*c</li>
                        <li>418*T</li>
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <FormattedMessage
                        id="calculator.instruction.table.to.use.affixes"
                        defaultMessage="Affixes"
                      />
                    </th>
                    <td dir="auto">
                      <FormattedMessage
                        id="calculator.instruction.table.to.use.affixes.type"
                        defaultMessage="Percent sign (%) and metric affixes ({affixes})"
                        values={{
                          affixes: 'd, c, m, u, n, p, k, M, G, T',
                        }}
                      />
                    </td>
                    <td dir="auto">
                      <ul className="list-unstyled m-0">
                        <li>20%</li>
                        <li>20c</li>
                        <li>418T</li>
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <FormattedMessage
                        id="calculator.instruction.table.to.use.basic.functions"
                        defaultMessage="Basic functions"
                      />
                    </th>
                    <td dir="auto">abs, exp, fact, factorial, ln, log2, log10, sqrt</td>
                    <td dir="auto">
                      <ul className="list-unstyled m-0">
                        <li>abs(x+y)</li>
                        <li>sqrt(x^2-y)</li>
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <FormattedMessage
                        id="calculator.instruction.table.to.use.trig.functions"
                        defaultMessage="Trigonometric functions"
                      />
                    </th>
                    <td dir="auto">
                      <ul className="list-unstyled m-0">
                        <li>sin, cos, tan, sec, csc, cot</li>
                        <li>arcsin, sinh, arcsinh</li>
                      </ul>
                    </td>
                    <td dir="auto">
                      <ul className="list-unstyled m-0">
                        <li>sin(4x+y)</li>
                        <li>arccsch(4x+y)</li>
                      </ul>
                    </td>
                    <td dir="auto" />
                  </tr>
                  <tr>
                    <th scope="row">
                      <FormattedMessage
                        id="calculator.instruction.table.to.use.scientific.notation"
                        defaultMessage="Scientific notation"
                      />
                    </th>
                    <td dir="auto">
                      <FormattedMessage
                        id="calculator.instruction.table.to.use.scientific.notation.type1"
                        defaultMessage="{exponentSyntax} and the exponent"
                        values={{
                          exponentSyntax: '10^',
                        }}
                      />
                    </td>
                    <td dir="auto">10^-9</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <FormattedMessage
                        id="calculator.instruction.table.to.use.scientific.notation.type2"
                        defaultMessage="{notationSyntax} notation"
                        values={{
                          notationSyntax: 'e',
                        }}
                      />
                    </th>
                    <td dir="auto">
                      <FormattedMessage
                        id="calculator.instruction.table.to.use.scientific.notation.type3"
                        defaultMessage="{notationSyntax} and the exponent"
                        values={{
                          notationSyntax: '1e',
                        }}
                      />
                    </td>
                    <td dir="auto">1e-9</td>
                  </tr>
                </tbody>
              </table>
            </Collapsible.Body>
          </Collapsible.Advanced>
        </Collapsible.Body>
      </Collapsible.Advanced>
    );
  }
}

Calculator.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Calculator);

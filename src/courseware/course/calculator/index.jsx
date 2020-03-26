import React, { Component } from 'react';
import { Collapsible } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalculator, faQuestionCircle, faTimesCircle, faEquals,
} from '@fortawesome/free-solid-svg-icons';

import './calculator.scss';

export default class Calculator extends Component {
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
        <div className="container-fluid text-right">
          <Collapsible.Trigger tag="a" className="calculator-trigger btn btn-light border-gray">
            <Collapsible.Visible whenOpen>
              <FontAwesomeIcon icon={faTimesCircle} aria-hidden="true" className="mr-2" />
            </Collapsible.Visible>
            <Collapsible.Visible whenClosed>
              <FontAwesomeIcon icon={faCalculator} aria-hidden="true" className="mr-2" />
            </Collapsible.Visible>
                Calculator
          </Collapsible.Trigger>
        </div>
        <Collapsible.Body className="bg-light pt-4">
          <form onSubmit={this.handleSubmit} className="container-fluid form-inline flex-nowrap">
            <label htmlFor="calculator-input">
              <span className="sr-only">Calculator Input</span>
              <input
                type="text"
                id="calculator-input"
                title="Calculator Input"
                placeholder="Calculator input"
                className="form-control w-100"
                onChange={(event) => this.changeEquation(event.target.value)}
              />
            </label>
            <button
              type="submit"
              title="Calculate"
              className="btn btn-primary mx-3"
              aria-label="Calculate"
            >
              <FontAwesomeIcon icon={faEquals} aria-hidden="true" />
            </button>
            <label htmlFor="calculator-output">
              <span className="sr-only">Calculator Result</span>
              <input
                type="text"
                id="calculator-output"
                tabIndex="-1"
                readOnly
                placeholder="Result"
                className="form-control font-weight-bold w-100"
                value={this.state.result}
                onChange={(event) => this.setState(() => ({ result: event.target.value }))}
              />
            </label>
          </form>

          <Collapsible.Advanced>
            <div className="container-fluid">
              <Collapsible.Trigger className="btn btn-link btn-sm px-0 d-inline-flex align-items-center">
                <Collapsible.Visible whenOpen>
                  <FontAwesomeIcon icon={faTimesCircle} aria-hidden="true" className="mr-2" />
                </Collapsible.Visible>
                <Collapsible.Visible whenClosed>
                  <FontAwesomeIcon icon={faQuestionCircle} aria-hidden="true" className="mr-2" />
                </Collapsible.Visible>
                    Calculator Instructions
              </Collapsible.Trigger>
            </div>
            <Collapsible.Body className="container-fluid pt-3" style={{ maxHeight: '50vh', overflow: 'auto' }}>
              <FormattedMessage
                tagName="h6"
                id="calculator.instructions"
                defaultMessage="For detailed information, see {expressions_link} in the {edx_guide}."
                values={{
                  expressions_link: (
                    <a href="https://edx.readthedocs.io/projects/edx-guide-for-students/en/latest/completing_assignments/SFD_mathformatting.html#math-formatting">
                      <FormattedMessage
                        id="calculator.instructions.expressions.link.title"
                        defaultMessage="Entering Mathematical and Scientific Expressions"
                      />
                    </a>
                  ),
                  edx_guide: (
                    <a href="https://edx-guide-for-students.readthedocs.io/en/latest/index.html">
                      <FormattedMessage
                        id="calculator.instructions.edx.guide.link.title"
                        defaultMessage="edX Guide for Students"
                      />
                    </a>
                  ),
                }}
              />
              <p><strong>Useful tips:</strong></p>
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
                    <th scope="col">To Use</th>
                    <th scope="col">Type</th>
                    <th scope="col">Examples</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Numbers</th>
                    <td>
                      <ul className="list-unstyled m-0">
                        <li>Integers</li>
                        <li>Fractions</li>
                        <li>Decimals</li>
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
                    <th scope="row">Operators</th>
                    <td dir="auto">
                      <ul className="list-unstyled m-0">
                        <li>+ - * / (add, subtract, multiply, divide)</li>
                        <li>^ (raise to a power)</li>
                        <li>|| (parallel resistors)</li>
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
                    <th scope="row">Constants</th>
                    <td dir="auto">c, e, g, i, j, k, pi, q, T</td>
                    <td dir="auto">
                      <ul className="list-unstyled m-0">
                        <li>20*c</li>
                        <li>418*T</li>
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Affixes</th>
                    <td dir="auto">Percent sign (%) and metric affixes (d, c, m, u, n, p, k, M, G, T)</td>
                    <td dir="auto">
                      <ul className="list-unstyled m-0">
                        <li>20%</li>
                        <li>20c</li>
                        <li>418T</li>
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Basic functions</th>
                    <td dir="auto">abs, exp, fact or factorial, ln, log2, log10, sqrt</td>
                    <td dir="auto">
                      <ul className="list-unstyled m-0">
                        <li>abs(x+y)</li>
                        <li>sqrt(x^2-y)</li>
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Trigonometric functions</th>
                    <td dir="auto">
                      <ul className="list-unstyled m-0">
                        <li>sin, cos, tan, sec, csc, cot</li>
                        <li>arcsin, sinh, arcsinh, etc.</li>
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
                    <th scope="row">Scientific notation</th>
                    <td dir="auto">10^ and the exponent</td>
                    <td dir="auto">10^-9</td>
                  </tr>
                  <tr>
                    <th scope="row">e notation</th>
                    <td dir="auto">1e and the exponent</td>
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

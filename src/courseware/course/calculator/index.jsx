import React, { Component } from 'react';
import { Collapsible } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator, faQuestion } from '@fortawesome/free-solid-svg-icons';


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
      <div className="container calc-main fixed-bottom py-4" style={{ zIndex: 100 }}>
        <div className="d-flex justify-content-end">
          <Collapsible.Advanced>
            <Collapsible.Trigger>
              <button className="btn btn-primary" type="button">
                <FontAwesomeIcon icon={faCalculator} aria-hidden="true" />
              </button>
            </Collapsible.Trigger>
            <Collapsible.Body>
              <div id="calculator_wrapper" className="w-100 bg-light p-4">
                <form onSubmit={this.handleSubmit} className="d-flex justify-content-around" type="" id="calculator">
                  <label htmlFor="calculator_input" className="w-50"><span className="sr-only">Enter equation</span>
                    <input
                      type="text"
                      id="calculator_input"
                      title="Calculator Input Field"
                      className="form-control"
                      onChange={(event) => this.changeEquation(event.target.value)}
                    />
                  </label>
                  <Collapsible.Advanced>
                    <Collapsible.Trigger>
                      <FontAwesomeIcon icon={faQuestion} aria-hidden="true" />
                    </Collapsible.Trigger>
                    <Collapsible.Body>
                      <div className="d-none container w-25 mh-100">
                        <ul>
                          <li className="hint-item" id="hint-moreinfo">
                            <p className="sr-only">Use the arrow keys to navigate the tips or use the tab key to return to the calculator</p>
                            <p>
                              <strong>
                                <FormattedMessage
                                  id="calculator.instructions"
                                  defaultMessage="For detailed information, see <a>Entering Mathematical and Scientific Expressions</a> in the <ga>edX Guide for Students</ga>."
                                  values={{
                                    a: (...chunks) => (<a href="https://edx.readthedocs.io/projects/edx-guide-for-students/en/latest/completing_assignments/SFD_mathformatting.html#math-formatting">{chunks}</a>),
                                    ga: (...chunks) => (<a href="https://edx-guide-for-students.readthedocs.io/en/latest/index.html">{chunks}</a>),
                                  }}
                                />
                              </strong>
                            </p>
                          </li>
                          <li className="small" id="hint-tips"><p><strong>Tips:</strong></p>
                            <ul>
                              <li className="hint-item" id="hint-paren">
                                <p>
                                  <FormattedMessage
                                    id="calculator.hint1"
                                    defaultMessage="Use parentheses () to make expressions clear. You can use parentheses inside other parentheses."
                                  />
                                </p>
                              </li>
                              <li className="hint-item" id="hint-spaces">
                                <p>
                                  <FormattedMessage
                                    id="calculator.hint2"
                                    defaultMessage="Do not use spaces in expressions."
                                  />
                                </p>
                              </li>
                              <li className="hint-item" id="hint-howto-constants">
                                <p>
                                  <FormattedMessage
                                    id="calculator.hint3"
                                    defaultMessage="For constants, indicate multiplication explicitly (example: 5*c)."
                                  />
                                </p>
                              </li>
                              <li className="hint-item" id="hint-howto-maffixes">
                                <p>
                                  <FormattedMessage
                                    id="calculator.hint4"
                                    defaultMessage="For affixes, type the number and affix without a space (example: 5c)."
                                  />
                                </p>
                              </li>
                              <li className="hint-item" id="hint-howto-functions">
                                <p>
                                  <FormattedMessage
                                    id="calculator.hint5"
                                    defaultMessage="For functions, type the name of the function, then the expression in parentheses."
                                  />
                                </p>
                              </li>
                            </ul>
                          </li>
                          <li className="hint-item" id="hint-list">
                            <table className="table">
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
                                                      Integers<br />
                                                      Fractions<br />
                                                      Decimals
                                  </td>
                                  <td dir="auto">
                                                      2520<br />
                                                      2/3<br />
                                                      3.14, .98
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="row">Operators</th>
                                  <td dir="auto">
                                                      + - * / (add, subtract, multiply, divide)<br />
                                                      ^ (raise to a power)<br />
                                                      || (parallel resistors)
                                  </td>
                                  <td dir="auto">
                                                      x+(2*y)/x-1
                                                      x^(n+1)<br />
                                                      v_IN+v_OUT<br />
                                                      1||2
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="row">Constants</th>
                                  <td dir="auto">c, e, g, i, j, k, pi, q, T</td>
                                  <td dir="auto">
                                                      20*c<br />
                                                      418*T
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="row">Affixes</th>
                                  <td dir="auto">Percent sign (%) and metric affixes (d, c, m, u, n, p, k, M, G, T)</td>
                                  <td dir="auto">
                                                      20%<br />
                                                      20c<br />
                                                      418T
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="row">Basic functions</th>
                                  <td dir="auto">abs, exp, fact or factorial, ln, log2, log10, sqrt</td>
                                  <td dir="auto">
                                                      abs(x+y)<br />
                                                      sqrt(x^2-y)
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="row">Trigonometric functions</th>
                                  <td dir="auto">
                                                      sin, cos, tan, sec, csc, cot<br />
                                                      arcsin, sinh, arcsinh, etc.<br />
                                  </td>
                                  <td dir="auto">
                                                      sin(4x+y)<br />
                                                      arccsch(4x+y)
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
                          </li>
                        </ul>
                      </div>
                    </Collapsible.Body>
                  </Collapsible.Advanced>
                  <button
                    type="submit"
                    title="Calculate"
                    className="btn btn-primary btn-lg mx-2"
                    aria-label="Calculate"
                  >
                      =
                  </button>
                  <label htmlFor="calculator_output" className="w-25"><span className="sr-only">Result</span>
                    <input
                      type="text"
                      id="calculator_output"
                      tabIndex="-1"
                      readOnly
                      className="form-control text-center font-weight-bold"
                      value={this.state.result}
                      onChange={(event) => this.setState(() => ({ result: event.target.value }))}
                    />
                  </label>
                </form>
              </div>
            </Collapsible.Body>
          </Collapsible.Advanced>
        </div>
      </div>
    );
  }
}

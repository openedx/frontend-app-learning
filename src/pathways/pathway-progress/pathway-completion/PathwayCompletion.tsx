import { FormattedMessage } from "@edx/frontend-platform/i18n";
import messages from "./messages";
import { PathwayProgressDonut } from "./PathwayProgressDonut";

export interface PathwayCompletionProps {
  categoryLabel: string;
  completed: number;
  total: number;
}

export const PathwayCompletion = ({
  categoryLabel,
  completed,
  total,
}: PathwayCompletionProps) => (
  <section className="mb-4 rounded raised-card p-4">
    <div className="row w-100 m-0 align-items-center pl-3">
      <div className="col-12 col-sm-6 col-md-7 p-0">
        <h2>
          <FormattedMessage {...messages.completionTitle} values={{ categoryLabel }} />
        </h2>
        <p className="small">
          <FormattedMessage {...messages.completionDescription} values={{ categoryLabel }} />
        </p>
      </div>
      <div className="col-12 col-sm-6 col-md-5 p-0 text-center">
        <PathwayProgressDonut completed={completed} total={total} />
      </div>
    </div>
  </section>
);

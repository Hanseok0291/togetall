type Props = Readonly<{
  errorMessage: string;
  hasValue: boolean;
}>;

export function HelpOrErrorMessage({ errorMessage, hasValue }: Props) {
  if (errorMessage) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100"
      >
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
      {hasValue ? (
        <p>
          <span className="font-semibold text-zinc-50">− / +</span> 버튼으로 속도를 0.1&nbsp;km/h씩
          바꾸면, 그에 맞는 페이스가 다시 계산돼요.
        </p>
      ) : (
        <p>
          숫자만 입력해 주세요. 예) <span className="font-semibold">430</span> →{" "}
          <span className="font-semibold">4:30</span>/km
        </p>
      )}
    </div>
  );
}


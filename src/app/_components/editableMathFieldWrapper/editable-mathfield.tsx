"use client";
import React, { useEffect, useRef, type HTMLAttributes } from "react";
import MQ, { type MathField, type IMathFieldConfig } from "@digabi/mathquill";

const MathQuill = MQ.getInterface(2); //it's currently the latest version

type EditableMathFieldProps = {
  latex?: string;
  onChange?: (mf: MathField) => void;
  //since onChange is called everytime edit is called.
  config?: Omit<IMathFieldConfig, "handlers"> & {
    handlers: Omit<IMathFieldConfig["handlers"], "edit">;
  };
  mathquillDidMount?: (mf: MathField) => void;
};

const EditableMathField = ({
  latex,
  onChange,
  config,
  mathquillDidMount,
  ...spanProps
}: EditableMathFieldProps &
  Omit<HTMLAttributes<HTMLSpanElement>, "onChange">) => {
  //mathquill fires (production two, dev mode 4 sinc react dose evrythin twice)  edit events on mount and we dont want tolisten to them.
  const ignoreEditEvents = useRef(4);

  const mathField = useRef<MathField | null>(null);
  const wrapperElement = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    if (!wrapperElement.current) return;

    const myConfig: IMathFieldConfig = {
      handlers: {
        edit(mathField) {
          if (ignoreEditEvents.current > 0) {
            ignoreEditEvents.current -= 1;
          } else {
            if (onChange) {
              onChange(mathField);
            }
          }
        },
      },
    };

    const combinedConfig: IMathFieldConfig = config?.handlers
      ? {
          ...myConfig,
          ...config,
          handlers: {
            ...config.handlers,
            ...myConfig.handlers,
          },
        }
      : {
          ...myConfig,
          ...config,
        };

    mathField.current = MathQuill.MathField(
      wrapperElement.current,
      combinedConfig,
    );

    mathField.current.latex(latex ? latex : "");

    if (mathquillDidMount) {
      mathquillDidMount(mathField.current);
    }
  }, []);

  useEffect(() => {
    if (mathField.current && mathField.current.latex() !== latex) {
      mathField.current.latex(latex ? latex : "");
    }
  }, [latex]);

  return <span {...spanProps} ref={wrapperElement} />;
};

export default EditableMathField; // the styles are loaded to in the root layout.

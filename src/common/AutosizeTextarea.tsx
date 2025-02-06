import { Textarea, TextareaProps } from "@chakra-ui/react";
import ResizeTextarea from "react-textarea-autosize";
import React from "react";

const AutosizeTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, ref) => {
    return (
      <Textarea
        minH="unset"
        overflowY={"scroll"}
        w="100%"
        resize="none"
        className="text-area-chat"
        ref={ref}
        outline={0}
        as={ResizeTextarea}
        {...props}
      />
    );
  },
);

AutosizeTextarea.displayName = "AutosizeTextarea";

export default AutosizeTextarea;

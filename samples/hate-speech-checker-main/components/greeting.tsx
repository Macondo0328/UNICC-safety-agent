import Image from 'next/image';
import { motion } from 'framer-motion';

export const Greeting = () => {
  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center"
      >
        <Image
          src="/images/M.I.R.R.O.R.svg"
          alt="Mirror Logo"
          width={60}
          height={60}
          className="h-90 w-auto"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-semibold text-center"
      >
        Documents, Audio, or Video are supported
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-lg text-zinc-600 leading-relaxed text-center"
      >
        This tool helps recognize hate speech and other forms of harmful
        content.
        <br />
        Simply upload and begin
      </motion.div>
    </div>
  );
};
